import { getExtensionApi } from './storage';

export type ExtensionMessage =
  | { type: 'GET_ACTIVE_TAB_INFO' }
  | { type: 'HIGHLIGHT_ACTIVE_PAGE'; color?: string }
  | { type: 'OPEN_SIDE_PANEL' }
  | { type: 'OPEN_OPTIONS_PAGE' }
  | { type: 'PING_BACKGROUND' };

export interface ActiveTabInfo {
  title: string;
  url: string;
  favIconUrl?: string;
  selectionText?: string;
  wordCount?: number;
  headingCount?: number;
}

export async function getActiveTabInfo(): Promise<ActiveTabInfo> {
  const api = getExtensionApi();
  if (api?.tabs?.query) {
    try {
      const [tab] = await api.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        try {
          const response = await api.tabs.sendMessage(tab.id, {
            type: 'GET_PAGE_METRICS',
          });
          if (response) {
            return {
              title: tab.title || 'Active Tab',
              url: tab.url || '',
              favIconUrl: tab.favIconUrl,
              ...response,
            };
          }
        } catch {
          // Content script may not be injected on restricted browser:// pages
        }
        return {
          title: tab.title || 'Untitled Tab',
          url: tab.url || 'chrome://newtab',
          favIconUrl: tab.favIconUrl,
        };
      }
    } catch {
      // Fallback for dev preview
    }
  }

  return {
    title: document.title || 'Extension Preview Tab',
    url: window.location.href,
    selectionText: window.getSelection()?.toString() || '',
    wordCount: 428,
    headingCount: 12,
  };
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
