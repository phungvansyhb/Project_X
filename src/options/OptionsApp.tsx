import React, { useState } from 'react';
import {
  Palette,
  Sliders,
  Database,
  Compass,
  RotateCcw,
  Download,
  CheckCircle2,
  PanelRight,
  Layers,
} from 'lucide-react';
import {
  useExtensionSettings,
  useThemeSync,
  ThemeMode,
  ExtensionSettings,
} from '../shared/storage';
import { openSidePanelFromWindow } from '../shared/messaging';

export const OptionsApp: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { settings, saveSettings, restoreDefaults } = useExtensionSettings();
  useThemeSync(settings);

  const [activeTab, setActiveTab] = useState<
    'general' | 'appearance' | 'storage' | 'browsers'
  >('general');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const notify = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 2400);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-x-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    notify('Exported settings JSON');
  };

  const handleReset = async () => {
    await restoreDefaults();
    notify('Settings restored to default values');
  };

  return (
    <div
      style={{
        minHeight: embedded ? '100%' : '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Bar */}
      <header
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'var(--accent-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700 }}>
              Project X — Extension Options
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Configure Side Panel behavior, appearance, and cross-browser preferences
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {statusBanner && (
            <span className="badge" style={{ padding: '6px 12px', fontSize: 12 }}>
              <CheckCircle2 size={14} />
              {statusBanner}
            </span>
          )}
          {!embedded && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => openSidePanelFromWindow()}
            >
              <PanelRight size={15} />
              <span>Open Side Panel</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div
        style={{
          maxWidth: 960,
          width: '100%',
          margin: '0 auto',
          padding: '24px 20px',
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: 24,
          flex: 1,
        }}
      >
        {/* Sidebar Navigation */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            type="button"
            className={activeTab === 'general' ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
            onClick={() => setActiveTab('general')}
          >
            <Sliders size={16} />
            <span>Side Panel & Behavior</span>
          </button>
          <button
            type="button"
            className={activeTab === 'appearance' ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
            onClick={() => setActiveTab('appearance')}
          >
            <Palette size={16} />
            <span>Theme & Appearance</span>
          </button>
          <button
            type="button"
            className={activeTab === 'storage' ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
            onClick={() => setActiveTab('storage')}
          >
            <Database size={16} />
            <span>Storage & Backup</span>
          </button>
          <button
            type="button"
            className={activeTab === 'browsers' ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
            onClick={() => setActiveTab('browsers')}
          >
            <Compass size={16} />
            <span>Browser Targets</span>
          </button>
        </aside>

        {/* Settings Panel */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeTab === 'general' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                  Side Panel & Extension Behavior
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Changes are saved automatically to <code>chrome.storage.local</code> and sync immediately with the Side Panel.
                </p>
              </div>

              {/* Toggle 1 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  paddingBottom: 16,
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    Open Side Panel on Toolbar Icon Click
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Uses <code>chrome.sidePanel.setPanelBehavior</code> so clicking the extension icon opens the Side Panel directly instead of the popup.
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.openPanelOnActionClick}
                    onChange={(e) => {
                      saveSettings({ openPanelOnActionClick: e.target.checked });
                      notify('Updated toolbar click behavior');
                    }}
                  />
                  <span className="slider" />
                </label>
              </div>

              {/* Toggle 2 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  paddingBottom: 16,
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    Enable Page Heading Highlighter
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Allows the Side Panel to highlight headings on the active webpage via the Content Script.
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.enablePageHighlighter}
                    onChange={(e) => {
                      saveSettings({ enablePageHighlighter: e.target.checked });
                      notify('Updated page highlighter preference');
                    }}
                  />
                  <span className="slider" />
                </label>
              </div>

              {/* Toggle 3 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  paddingBottom: 16,
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    Right-Click Context Menu Integration
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Adds a &ldquo;Save selection to Project X Side Panel&rdquo; item to the browser context menu.
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.enableContextMenu}
                    onChange={(e) => {
                      saveSettings({ enableContextMenu: e.target.checked });
                      notify('Updated context menu integration');
                    }}
                  />
                  <span className="slider" />
                </label>
              </div>

              {/* Shortcut Hint */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>
                  Preferred Shortcut Display Label
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ maxWidth: 260 }}
                  value={settings.customShortcutHint}
                  onChange={(e) =>
                    saveSettings({ customShortcutHint: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                  Theme & Accent Palette
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Customize the look and feel of both the Side Panel and Options Page.
                </p>
              </div>

              {/* Theme Mode Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Color Mode</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={
                        settings.theme === mode
                          ? 'btn btn-primary'
                          : 'btn btn-secondary'
                      }
                      style={{ textTransform: 'capitalize', minWidth: 96 }}
                      onClick={() => {
                        saveSettings({ theme: mode });
                        notify(`Theme set to ${mode}`);
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Accent Color</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {(
                    [
                      { id: 'indigo', label: 'Indigo', hex: '#6366f1' },
                      { id: 'emerald', label: 'Emerald', hex: '#10b981' },
                      { id: 'rose', label: 'Rose', hex: '#f43f5e' },
                      { id: 'amber', label: 'Amber', hex: '#f59e0b' },
                    ] as const
                  ).map((swatch) => (
                    <button
                      key={swatch.id}
                      type="button"
                      className="btn btn-secondary"
                      style={{
                        borderColor:
                          settings.accentColor === swatch.id
                            ? swatch.hex
                            : 'var(--border-color)',
                        borderWidth: settings.accentColor === swatch.id ? 2 : 1,
                      }}
                      onClick={() => {
                        saveSettings({
                          accentColor: swatch.id as ExtensionSettings['accentColor'],
                        });
                        notify(`Accent color updated to ${swatch.label}`);
                      }}
                    >
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: swatch.hex,
                        }}
                      />
                      <span>{swatch.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                  Extension Storage Inspector
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Inspect, export, or reset the raw state stored in <code>chrome.storage.local</code>.
                </p>
              </div>

              <pre
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  padding: 14,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  overflowX: 'auto',
                  border: '1px solid var(--border-color)',
                  maxHeight: 280,
                }}
              >
                {JSON.stringify(settings, null, 2)}
              </pre>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExportJson}
                >
                  <Download size={14} />
                  <span>Export JSON</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReset}
                >
                  <RotateCcw size={14} />
                  <span>Reset to Defaults</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'browsers' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                  Cross-Browser Manifest V3 Guide
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  How to load the built <code>dist/</code> folder across Chromium browsers and Safari.
                </p>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <div
                  style={{
                    padding: 12,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-elevated)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                    1. Chrome / Brave / Edge (Chromium MV3)
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Run <code>npm run build</code>, open <code>chrome://extensions</code> (or <code>edge://extensions</code> / <code>brave://extensions</code>), enable <strong>Developer mode</strong>, click <strong>Load unpacked</strong>, and select the <code>dist/</code> directory.
                  </div>
                </div>

                <div
                  style={{
                    padding: 12,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-elevated)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                    2. Safari (macOS / iOS Web Extensions)
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Run <code>npm run build</code>, then convert the <code>dist/</code> bundle using Apple&rsquo;s Xcode converter:{' '}
                    <code>xcrun safari-web-extension-converter dist/</code>. The shared storage wrapper automatically resolves both <code>browser.*</code> and <code>chrome.*</code> namespaces.
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
