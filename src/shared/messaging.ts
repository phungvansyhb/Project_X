import {
  getExtensionApi,
  getSettings,
  saveVocabItem,
  VocabItem,
  normalizePageUrl,
} from './storage';
import { translateText, lookupIpa, TranslationResult } from '../background/translator';

export type ExtensionMessage =
  | {
      type: 'TRANSLATE_TEXT';
      text: string;
      pageUrl?: string;
      pageTitle?: string;
      contextSentence?: string;
      contextParagraph?: string;
      autoSave?: boolean;
    }
  | { type: 'GET_SELECTION_CONTEXT' }
  | { type: 'GET_TAB_CONTEXT' }
  | { type: 'FETCH_IPA'; text: string }
  | { type: 'GET_ACTIVE_TAB_INFO' }
  | { type: 'HIGHLIGHT_ACTIVE_PAGE'; color?: string }
  | { type: 'SCROLL_TO_VOCAB'; sourceText: string }
  | { type: 'REFRESH_HIGHLIGHTS' }
  | { type: 'OPEN_SIDE_PANEL' }
  | { type: 'OPEN_OPTIONS_PAGE' };

export interface ActiveTabInfo {
  title: string;
  url: string;
  normalizedUrl: string;
  favIconUrl?: string;
  selectionText?: string;
  wordCount?: number;
  headingCount?: number;
  highlightedCount?: number;
}

export interface TranslationResponse {
  ok: boolean;
  result?: TranslationResult;
  savedItem?: VocabItem;
  error?: string;
}

/**
 * Request translation via Background Service Worker (or direct fallback in Dev Workbench)
 */
export async function requestTranslation(params: {
  text: string;
  pageUrl?: string;
  pageTitle?: string;
  contextSentence?: string;
  contextParagraph?: string;
  autoSave?: boolean;
}): Promise<TranslationResponse> {
  const api = getExtensionApi();
  const cleanText = params.text.trim();
  if (!cleanText) {
    return { ok: false, error: 'Empty selection' };
  }

  // 1. Try sending message to Background Service Worker when running in browser extension context
  if (api?.runtime?.sendMessage) {
    try {
      const response = (await api.runtime.sendMessage({
        type: 'TRANSLATE_TEXT',
        text: cleanText,
        pageUrl: params.pageUrl || window.location.href,
        pageTitle: params.pageTitle || document.title,
        contextSentence: params.contextSentence,
        contextParagraph: params.contextParagraph,
        autoSave: params.autoSave ?? true,
      })) as TranslationResponse | undefined;

      if (response && response.ok && response.result) {
        return response;
      }
    } catch {
      // Fallback to direct translation when running in Vite Dev Workbench
    }
  }

  // 2. Direct execution fallback (Vite Dev Workbench or extension page context)
  try {
    const settings = await getSettings();
    const pageTitle = params.pageTitle || document.title;
    const result = await translateText(cleanText, settings.targetLang, settings, {
      sentence: params.contextSentence,
      paragraph: params.contextParagraph,
      pageTitle,
    });
    let savedItem: VocabItem | undefined;

    if (params.autoSave ?? settings.autoTranslateOnSelect) {
      const saved = await saveVocabItem({
        sourceText: result.sourceText,
        translatedText: result.translatedText,
        phonetic: result.phonetic,
        partOfSpeech: result.partOfSpeech,
        contextSentence: params.contextSentence,
        alternativeMeanings: result.alternativeMeanings,
        targetLang: result.targetLang,
        pageUrl: params.pageUrl || window.location.href,
        pageTitle,
      });
      savedItem = saved.item;
    }

    return { ok: true, result, savedItem };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Translation failed',
    };
  }
}

/**
 * Request IPA phonetic transcription via Background Service Worker (or direct lookup in Dev Workbench)
 */
export async function requestIpa(text: string): Promise<string | undefined> {
  const cleanText = text.trim();
  if (!cleanText) return undefined;

  const api = getExtensionApi();
  if (api?.runtime?.sendMessage) {
    try {
      const response = (await api.runtime.sendMessage({
        type: 'FETCH_IPA',
        text: cleanText,
      })) as { ok?: boolean; phonetic?: string } | undefined;
      if (response?.ok) {
        return response.phonetic;
      }
    } catch {
      // Fallback to direct lookup when running in Vite Dev Workbench
    }
  }

  return lookupIpa(cleanText);
}

/**
 * Resolves the top-level tab URL and title when running inside an iframe/subframe
 * so vocabulary highlights and saved items are consistently indexed under the main page URL.
 */
export async function requestTabContext(): Promise<{
  pageUrl?: string;
  pageTitle?: string;
}> {
  const api = getExtensionApi();
  if (api?.runtime?.sendMessage) {
    try {
      const response = (await api.runtime.sendMessage({
        type: 'GET_TAB_CONTEXT',
      })) as { ok?: boolean; pageUrl?: string; pageTitle?: string } | undefined;
      if (response?.ok && response.pageUrl) {
        return {
          pageUrl: response.pageUrl,
          pageTitle: response.pageTitle,
        };
      }
    } catch {
      // Ignore if background service worker is unavailable
    }
  }
  return {};
}

export async function getActiveTabInfo(): Promise<ActiveTabInfo> {
  const api = getExtensionApi();
  if (api?.tabs?.query) {
    try {
      const [tab] = await api.tabs.query({ active: true, currentWindow: true });
      if (tab?.id && tab.url) {
        const normalizedUrl = normalizePageUrl(tab.url);
        try {
          const response = await api.tabs.sendMessage(tab.id, {
            type: 'GET_PAGE_METRICS',
          });
          if (response) {
            return {
              title: tab.title || 'Active Tab',
              url: tab.url,
              normalizedUrl,
              favIconUrl: tab.favIconUrl,
              ...response,
            };
          }
        } catch {
          // Content script may not be injected on restricted browser:// pages
        }
        return {
          title: tab.title || 'Untitled Tab',
          url: tab.url,
          normalizedUrl,
          favIconUrl: tab.favIconUrl,
        };
      }
    } catch {
      // Fallback for dev preview
    }
  }

  const fallbackUrl = window.location.href;
  return {
    title: document.title || 'Chrome Extensions Documentation — Interactive Demo',
    url: fallbackUrl,
    normalizedUrl: normalizePageUrl(fallbackUrl),
    selectionText: window.getSelection()?.toString() || '',
    wordCount: 428,
    headingCount: 12,
  };
}

export async function scrollToVocabOnPage(sourceText: string): Promise<boolean> {
  const api = getExtensionApi();
  if (api?.tabs?.query) {
    try {
      const [tab] = await api.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await api.tabs.sendMessage(tab.id, {
          type: 'SCROLL_TO_VOCAB',
          sourceText,
        });
        return true;
      }
    } catch {
      // Fall through to window event for Dev Workbench
    }
  }

  window.dispatchEvent(
    new CustomEvent('project_x_scroll_to_vocab', { detail: { sourceText } })
  );
  return true;
}

export async function triggerPageHighlight(accentColor: string): Promise<boolean> {
  const api = getExtensionApi();
  if (api?.tabs?.query) {
    try {
      const [tab] = await api.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await api.tabs.sendMessage(tab.id, {
          type: 'HIGHLIGHT_PAGE_HEADERS',
          accentColor,
        });
        return true;
      }
    } catch {
      return false;
    }
  }
  return true;
}

export function openOptionsPage(): void {
  const api = getExtensionApi();
  if (api?.runtime?.openOptionsPage) {
    api.runtime.openOptionsPage();
    return;
  }
  window.open('/options.html', '_blank', 'noopener,noreferrer');
}

export async function openSidePanelFromWindow(): Promise<boolean> {
  const api = getExtensionApi();
  if (api?.sidePanel?.open && api?.windows?.getCurrent) {
    try {
      const win = await api.windows.getCurrent();
      if (win.id !== undefined) {
        await api.sidePanel.open({ windowId: win.id });
        return true;
      }
    } catch {
      // Fallback below
    }
  }
  window.open('/sidepanel.html', '_blank', 'noopener,noreferrer');
  return false;
}
