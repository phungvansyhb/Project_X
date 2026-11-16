import {
  getExtensionApi,
  getSettings,
  saveVocabItem,
  STORAGE_KEY,
} from '../shared/storage';
import { translateText, lookupIpa } from './translator';

const CONTEXT_MENU_ID = 'project-x-translate-selection';

async function syncSidePanelBehavior() {
  const api = getExtensionApi();
  const settings = await getSettings();

  if (api?.sidePanel?.setPanelBehavior) {
    try {
      await api.sidePanel.setPanelBehavior({
        openPanelOnActionClick: settings.openPanelOnActionClick,
      });
    } catch (err) {
      console.warn('[Project X] Unable to set sidePanel behavior:', err);
    }
  }
}

let contextMenuSetupChain: Promise<void> = Promise.resolve();

function setupContextMenu(): Promise<void> {
  contextMenuSetupChain = contextMenuSetupChain.then(async () => {
    const api = getExtensionApi();
    if (!api?.contextMenus) return;

    const settings = await getSettings();
    await new Promise<void>((resolve) => {
      api.contextMenus.removeAll(() => {
        void api.runtime?.lastError;
        if (!settings.enableContextMenu) {
          resolve();
          return;
        }
        api.contextMenus.create(
          {
            id: CONTEXT_MENU_ID,
            title: 'Translate & Highlight with Project X',
            contexts: ['selection'],
          },
          () => {
            void api.runtime?.lastError;
            resolve();
          }
        );
      });
    });
  });
  return contextMenuSetupChain;
}

const api = getExtensionApi();

if (api?.runtime?.onInstalled) {
  api.runtime.onInstalled.addListener(async () => {
    await syncSidePanelBehavior();
    await setupContextMenu();
  });
}

if (api?.runtime?.onStartup) {
  api.runtime.onStartup.addListener(async () => {
    await syncSidePanelBehavior();
    await setupContextMenu();
  });
}

if (api?.storage?.onChanged) {
  api.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      await syncSidePanelBehavior();
      await setupContextMenu();
    }
  });
}

/**
 * Background Message Router for Content Scripts, Side Panel, and Popup
 */
if (api?.runtime?.onMessage) {
  api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'TRANSLATE_TEXT') {
      (async () => {
        try {
          const settings = await getSettings();
          const text = String(message.text || '').trim();
          if (!text) {
            sendResponse({ ok: false, error: 'Empty text' });
            return;
          }

          const result = await translateText(text, settings.targetLang, settings);
          const pageUrl = message.pageUrl || sender?.tab?.url || 'https://web.article';
          const pageTitle = message.pageTitle || sender?.tab?.title || 'Web Article';

          let savedItem;
          if (message.autoSave ?? settings.autoTranslateOnSelect) {
            const saved = await saveVocabItem({
              sourceText: result.sourceText,
              translatedText: result.translatedText,
              phonetic: result.phonetic,
              targetLang: result.targetLang,
              pageUrl,
              pageTitle,
            });
            savedItem = saved.item;
          }

          sendResponse({
            ok: true,
            result,
            savedItem,
          });
        } catch (err) {
          sendResponse({
            ok: false,
            error: err instanceof Error ? err.message : 'Translation error',
          });
        }
      })();
      return true; // Keep message channel open for async response
    }

    if (message?.type === 'FETCH_IPA') {
      (async () => {
        try {
          const text = String(message.text || '').trim();
          const phonetic = text ? await lookupIpa(text) : undefined;
          sendResponse({ ok: true, phonetic });
        } catch {
          sendResponse({ ok: false });
        }
      })();
      return true;
    }

    if (message?.type === 'OPEN_SIDE_PANEL') {
      const windowId = sender?.tab?.windowId;
      if (api.sidePanel?.open && windowId !== undefined) {
        api.sidePanel.open({ windowId }).catch(() => {});
      }
      sendResponse({ ok: true });
      return false;
    }

    return false;
  });
}

/**
 * Right-Click Context Menu: Translate & Highlight Selection
 */
if (api?.contextMenus?.onClicked) {
  api.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === CONTEXT_MENU_ID && info.selectionText) {
      const settings = await getSettings();
      const result = await translateText(
        info.selectionText,
        settings.targetLang,
        settings
      );

      await saveVocabItem({
        sourceText: result.sourceText,
        translatedText: result.translatedText,
        phonetic: result.phonetic,
        targetLang: result.targetLang,
        pageUrl: tab?.url || 'https://web.article',
        pageTitle: tab?.title || 'Web Article',
      });

      if (tab?.id && api.tabs?.sendMessage) {
        api.tabs.sendMessage(tab.id, { type: 'REFRESH_HIGHLIGHTS' }).catch(() => {});
      }

      if (api.sidePanel?.open && tab?.windowId !== undefined) {
        try {
          await api.sidePanel.open({ windowId: tab.windowId });
        } catch {
          // Ignore if user gesture restriction applies
        }
      }
    }
  });
}
