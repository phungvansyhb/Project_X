import { getExtensionApi, getSettings, updateSettings } from '../shared/storage';

const CONTEXT_MENU_ID = 'project-x-save-selection';

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

async function setupContextMenu() {
  const api = getExtensionApi();
  if (!api?.contextMenus) return;

  const settings = await getSettings();
  api.contextMenus.removeAll(() => {
    if (settings.enableContextMenu) {
      api.contextMenus.create({
        id: CONTEXT_MENU_ID,
        title: 'Save selection to Project X Side Panel',
        contexts: ['selection'],
      });
    }
  });
}

const api = getExtensionApi();

if (api?.runtime?.onInstalled) {
  api.runtime.onInstalled.addListener(async () => {
    await syncSidePanelBehavior();
    await setupContextMenu();
  });
}

if (api?.storage?.onChanged) {
  api.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName === 'local' && changes.project_x_settings) {
      await syncSidePanelBehavior();
      await setupContextMenu();
    }
  });
}

if (api?.contextMenus?.onClicked) {
  api.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === CONTEXT_MENU_ID && info.selectionText) {
      const settings = await getSettings();
      const newNote = {
        id: `note-${Date.now()}`,
        title: tab?.title ? `From: ${tab.title.slice(0, 40)}` : 'Captured Selection',
        content: info.selectionText,
        url: tab?.url,
        createdAt: Date.now(),
      };
      await updateSettings({
        notes: [newNote, ...settings.notes],
      });

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
