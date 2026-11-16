import { useEffect, useState, useCallback } from 'react';
import {
  DEFAULT_SETTINGS,
  ExtensionSettings,
  FALLBACK_CHANNEL,
  getExtensionApi,
  getSettings,
  resetSettings,
  STORAGE_KEY,
  updateSettings,
} from './storage';

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

