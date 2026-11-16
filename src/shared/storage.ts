import { useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
export type TranslationProvider = 'google' | 'gemini' | 'openai' | 'deepl';
export type SelectionTriggerMode = 'auto' | 'icon' | 'manual';
export type HighlightColor = 'yellow' | 'emerald' | 'sky' | 'rose';
export type AccentColor = 'indigo' | 'emerald' | 'rose' | 'amber';

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  url?: string;
  createdAt: number;
}

export interface VocabItem {
  id: string;
  sourceText: string;
  translatedText: string;
  targetLang: string;
  pageUrl: string;
  pageTitle: string;
  createdAt: number;
}

export interface PageVocabGroup {
  pageUrl: string;
  pageTitle: string;
  updatedAt: number;
  items: Record<string, VocabItem>;
}

export interface ExtensionSettings {
  theme: ThemeMode;
  accentColor: AccentColor;
  openPanelOnActionClick: boolean;
  enablePageHighlighter: boolean;
  enableContextMenu: boolean;
  autoCaptureSelection: boolean;
  customShortcutHint: string;
  // Translator & Vocabulary Highlighter Settings
  targetLang: string;
  translationProvider: TranslationProvider;
  apiKey: string;
  autoTranslateOnSelect: boolean;
  selectionMode: SelectionTriggerMode;
  highlightColor: HighlightColor;
  vocabByUrl: Record<string, PageVocabGroup>;
  notes: QuickNote[];
}

export const SUPPORTED_LANGUAGES: Array<{ code: string; label: string }> = [
  { code: 'vi', label: 'Vietnamese (Tiếng Việt)' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: 'Japanese (日本語)' },
  { code: 'ko', label: 'Korean (한국어)' },
  { code: 'zh-CN', label: 'Chinese Simplified (简体中文)' },
  { code: 'es', label: 'Spanish (Español)' },
  { code: 'fr', label: 'French (Français)' },
  { code: 'de', label: 'German (Deutsch)' },
];

const DEMO_PAGE_URL = 'https://developer.chrome.com/docs/extensions';

export const DEFAULT_SETTINGS: ExtensionSettings = {
  theme: 'system',
  accentColor: 'indigo',
  openPanelOnActionClick: true,
  enablePageHighlighter: true,
  enableContextMenu: true,
  autoCaptureSelection: true,
  customShortcutHint: 'Alt+Shift+X',
  targetLang: 'vi',
  translationProvider: 'google',
  apiKey: '',
  autoTranslateOnSelect: true,
  selectionMode: 'auto',
  highlightColor: 'yellow',
  vocabByUrl: {
    [DEMO_PAGE_URL]: {
      pageUrl: DEMO_PAGE_URL,
      pageTitle: 'Chrome Extensions Documentation — Interactive Demo',
      updatedAt: Date.now(),
      items: {
        'manifest v3': {
          id: 'vocab-demo-1',
          sourceText: 'Manifest V3',
          translatedText: 'Tệp kê khai phiên bản 3 (Chuẩn tiện ích mở rộng hiện đại)',
          targetLang: 'vi',
          pageUrl: DEMO_PAGE_URL,
          pageTitle: 'Chrome Extensions Documentation — Interactive Demo',
          createdAt: Date.now() - 120000,
        },
        'claymorphism': {
          id: 'vocab-demo-2',
          sourceText: 'Claymorphism',
          translatedText: 'Phong cách thiết kế đất sét 3D mềm mại',
          targetLang: 'vi',
          pageUrl: DEMO_PAGE_URL,
          pageTitle: 'Chrome Extensions Documentation — Interactive Demo',
          createdAt: Date.now() - 60000,
        },
      },
    },
  },
  notes: [
    {
      id: 'welcome-note',
      title: 'Welcome to Project X Side Panel',
      content:
        'Select any text on a webpage to translate, highlight with CSS ::highlight(), and auto-save by URL.',
      url: DEMO_PAGE_URL,
      createdAt: Date.now(),
    },
  ],
};

export const STORAGE_KEY = 'project_x_settings';
const FALLBACK_CHANNEL = 'project_x_storage_sync';

/**
 * Normalize a webpage URL so words saved on the same page match consistently
 * (strips #hash and noisy tracking query parameters while keeping origin + pathname).
 */
export function normalizePageUrl(rawUrl?: string): string {
  if (!rawUrl) return 'https://local.workbench/article';
  try {
    const parsed = new URL(rawUrl);
    if (
      parsed.protocol === 'chrome-extension:' ||
      parsed.protocol === 'moz-extension:' ||
      parsed.protocol === 'safari-web-extension:' ||
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1'
    ) {
      return DEMO_PAGE_URL;
    }
    return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '') || '/'}`;
  } catch {
    return rawUrl.split('#')[0] || DEMO_PAGE_URL;
  }
}

export function normalizeWordKey(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Cross-browser WebExtension API resolver (Chrome, Edge, Brave, Firefox, Safari)
 */
export function getExtensionApi(): typeof chrome | undefined {
  const globalAny = globalThis as unknown as {
    browser?: typeof chrome;
    chrome?: typeof chrome;
  };
  if (globalAny.browser?.storage) {
    return globalAny.browser;
  }
  if (globalAny.chrome?.storage) {
    return globalAny.chrome;
  }
  return undefined;
}

export async function getSettings(): Promise<ExtensionSettings> {
  const api = getExtensionApi();
  if (api?.storage?.local) {
    return new Promise((resolve) => {
      api.storage.local.get([STORAGE_KEY], (result) => {
        const stored = result?.[STORAGE_KEY] as Partial<ExtensionSettings> | undefined;
        resolve({
          ...DEFAULT_SETTINGS,
          ...(stored || {}),
          vocabByUrl: {
            ...DEFAULT_SETTINGS.vocabByUrl,
            ...(stored?.vocabByUrl || {}),
          },
        });
      });
    });
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ExtensionSettings>;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        vocabByUrl: {
          ...DEFAULT_SETTINGS.vocabByUrl,
          ...(parsed.vocabByUrl || {}),
        },
      };
    }
  } catch {
    // Ignore localStorage parse errors
  }
  return DEFAULT_SETTINGS;
}

export async function updateSettings(
  patch: Partial<ExtensionSettings>
): Promise<ExtensionSettings> {
  const current = await getSettings();
  const next: ExtensionSettings = { ...current, ...patch };
  const api = getExtensionApi();

  if (api?.storage?.local) {
    await new Promise<void>((resolve) => {
      api.storage.local.set({ [STORAGE_KEY]: next }, () => resolve());
    });
  } else {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel(FALLBACK_CHANNEL);
        bc.postMessage(next);
        bc.close();
      }
      window.dispatchEvent(new CustomEvent(FALLBACK_CHANNEL, { detail: next }));
    } catch {
      // Ignore storage quota errors
    }
  }

  return next;
}

export async function resetSettings(): Promise<ExtensionSettings> {
  return updateSettings(DEFAULT_SETTINGS);
}

/**
 * Vocabulary CRUD Helpers (Auto-Saved by Normalized Page URL)
 */
export async function saveVocabItem(input: {
  sourceText: string;
  translatedText: string;
  targetLang?: string;
  pageUrl: string;
  pageTitle?: string;
}): Promise<{ item: VocabItem; settings: ExtensionSettings }> {
  const current = await getSettings();
  const normalizedUrl = normalizePageUrl(input.pageUrl);
  const wordKey = normalizeWordKey(input.sourceText);

  const existingGroup = current.vocabByUrl[normalizedUrl] || {
    pageUrl: normalizedUrl,
    pageTitle: input.pageTitle || 'Web Article',
    updatedAt: Date.now(),
    items: {},
  };

  const existingItem = existingGroup.items[wordKey];
  const item: VocabItem = {
    id: existingItem?.id || `vocab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sourceText: input.sourceText.trim().replace(/\s+/g, ' '),
    translatedText: input.translatedText.trim(),
    targetLang: input.targetLang || current.targetLang,
    pageUrl: normalizedUrl,
    pageTitle: input.pageTitle || existingGroup.pageTitle || 'Web Article',
    createdAt: existingItem?.createdAt || Date.now(),
  };

  const nextVocabByUrl: Record<string, PageVocabGroup> = {
    ...current.vocabByUrl,
    [normalizedUrl]: {
      ...existingGroup,
      pageTitle: item.pageTitle,
      updatedAt: Date.now(),
      items: {
        ...existingGroup.items,
        [wordKey]: item,
      },
    },
  };

  const updated = await updateSettings({ vocabByUrl: nextVocabByUrl });
  return { item, settings: updated };
}

export async function removeVocabItem(
  pageUrl: string,
  sourceTextOrId: string
): Promise<ExtensionSettings> {
  const current = await getSettings();
  const normalizedUrl = normalizePageUrl(pageUrl);
  const group = current.vocabByUrl[normalizedUrl];
  if (!group) return current;

  const nextItems: Record<string, VocabItem> = {};
  const targetKey = normalizeWordKey(sourceTextOrId);

  for (const [key, value] of Object.entries(group.items)) {
    if (key !== targetKey && value.id !== sourceTextOrId) {
      nextItems[key] = value;
    }
  }

  const nextVocabByUrl = { ...current.vocabByUrl };
  if (Object.keys(nextItems).length === 0) {
    delete nextVocabByUrl[normalizedUrl];
  } else {
    nextVocabByUrl[normalizedUrl] = {
      ...group,
      updatedAt: Date.now(),
      items: nextItems,
    };
  }

  return updateSettings({ vocabByUrl: nextVocabByUrl });
}

export async function updateVocabItemMeaning(
  pageUrl: string,
  sourceTextOrId: string,
  newTranslatedText: string
): Promise<ExtensionSettings> {
  const current = await getSettings();
  const normalizedUrl = normalizePageUrl(pageUrl);
  const group = current.vocabByUrl[normalizedUrl];
  if (!group) return current;

  const nextItems: Record<string, VocabItem> = {};
  const targetKey = normalizeWordKey(sourceTextOrId);

  for (const [key, value] of Object.entries(group.items)) {
    if (key === targetKey || value.id === sourceTextOrId) {
      nextItems[key] = {
        ...value,
        translatedText: newTranslatedText.trim(),
      };
    } else {
      nextItems[key] = value;
    }
  }

  return updateSettings({
    vocabByUrl: {
      ...current.vocabByUrl,
      [normalizedUrl]: {
        ...group,
        updatedAt: Date.now(),
        items: nextItems,
      },
    },
  });
}

export async function clearPageVocab(pageUrl: string): Promise<ExtensionSettings> {
  const current = await getSettings();
  const normalizedUrl = normalizePageUrl(pageUrl);
  const nextVocabByUrl = { ...current.vocabByUrl };
  delete nextVocabByUrl[normalizedUrl];
  return updateSettings({ vocabByUrl: nextVocabByUrl });
}

export function getVocabForPage(
  settings: ExtensionSettings,
  pageUrl?: string
): VocabItem[] {
  const normalizedUrl = normalizePageUrl(pageUrl);
  const group = settings.vocabByUrl?.[normalizedUrl];
  if (!group?.items) return [];
  return Object.values(group.items).sort((a, b) => b.createdAt - a.createdAt);
}

export function getAllVocabItems(settings: ExtensionSettings): VocabItem[] {
  const all: VocabItem[] = [];
  for (const group of Object.values(settings.vocabByUrl || {})) {
    if (group?.items) {
      all.push(...Object.values(group.items));
    }
  }
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * React hook for reactive extension settings & vocabulary across Side Panel, Options Page, and Popup
 */
export function useExtensionSettings() {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSettings().then((initial) => {
      if (mounted) {
        setSettings(initial);
        setLoading(false);
      }
    });

    const api = getExtensionApi();
    if (api?.storage?.onChanged) {
      const listener = (
        changes: { [key: string]: chrome.storage.StorageChange },
        areaName: string
      ) => {
        if (areaName === 'local' && changes[STORAGE_KEY]?.newValue) {
          const nextVal = changes[STORAGE_KEY].newValue as Partial<ExtensionSettings>;
          setSettings({
            ...DEFAULT_SETTINGS,
            ...nextVal,
            vocabByUrl: nextVal.vocabByUrl || {},
          });
        }
      };
      api.storage.onChanged.addListener(listener);
      return () => {
        mounted = false;
        api.storage.onChanged.removeListener(listener);
      };
    }

    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<ExtensionSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };
    window.addEventListener(FALLBACK_CHANNEL, handleCustom);

    let bc: BroadcastChannel | undefined;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel(FALLBACK_CHANNEL);
      bc.onmessage = (event) => {
        if (event.data) {
          setSettings(event.data as ExtensionSettings);
        }
      };
    }

    return () => {
      mounted = false;
      window.removeEventListener(FALLBACK_CHANNEL, handleCustom);
      bc?.close();
    };
  }, []);

  const saveSettings = useCallback(async (patch: Partial<ExtensionSettings>) => {
    const updated = await updateSettings(patch);
    setSettings(updated);
    return updated;
  }, []);

  const restoreDefaults = useCallback(async () => {
    const defaults = await resetSettings();
    setSettings(defaults);
    return defaults;
  }, []);

  return { settings, loading, saveSettings, restoreDefaults };
}

/**
 * Apply Claymorphism theme, accent & highlight variables to document root
 */
export function useThemeSync(settings: ExtensionSettings) {
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark =
      settings.theme === 'dark' || (settings.theme === 'system' && prefersDark);

    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    root.setAttribute('data-accent', settings.accentColor);
    root.setAttribute('data-highlight', settings.highlightColor || 'yellow');
  }, [settings.theme, settings.accentColor, settings.highlightColor]);
}
