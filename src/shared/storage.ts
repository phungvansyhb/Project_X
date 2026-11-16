import { useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  url?: string;
  createdAt: number;
}

export interface ExtensionSettings {
  theme: ThemeMode;
  openPanelOnActionClick: boolean;
  enablePageHighlighter: boolean;
  enableContextMenu: boolean;
  autoCaptureSelection: boolean;
  accentColor: 'indigo' | 'emerald' | 'rose' | 'amber';
  customShortcutHint: string;
  notes: QuickNote[];
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  theme: 'system',
  openPanelOnActionClick: true,
  enablePageHighlighter: true,
  enableContextMenu: true,
  autoCaptureSelection: false,
  accentColor: 'indigo',
  customShortcutHint: 'Alt+Shift+X',
  notes: [
    {
      id: 'welcome-note',
      title: 'Welcome to Project X Side Panel',
      content:
        'Use this side panel alongside any webpage. Settings and notes sync automatically across Side Panel, Options Page, and Popup.',
      url: 'https://developer.chrome.com/docs/extensions/reference/api/sidePanel',
      createdAt: Date.now(),
    },
  ],
};

const STORAGE_KEY = 'project_x_settings';
const FALLBACK_CHANNEL = 'project_x_storage_sync';

/**
 * Cross-browser WebExtension API resolver (Chrome, Edge, Brave, Safari)
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
        resolve({ ...DEFAULT_SETTINGS, ...(stored || {}) });
      });
    });
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
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
 * React hook for reactive extension settings across Side Panel, Options Page, and Popup
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
          setSettings({
            ...DEFAULT_SETTINGS,
            ...(changes[STORAGE_KEY].newValue as Partial<ExtensionSettings>),
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
 * Apply theme & accent variables to document root
 */
export function useThemeSync(settings: ExtensionSettings) {
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark =
      settings.theme === 'dark' || (settings.theme === 'system' && prefersDark);

    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    root.setAttribute('data-accent', settings.accentColor);
  }, [settings.theme, settings.accentColor]);
}
