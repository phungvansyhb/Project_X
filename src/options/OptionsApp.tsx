import React, { useState, useMemo } from 'react';
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
  Languages,
  FileSpreadsheet,
} from 'lucide-react';
import {
  getAllVocabItems,
  SUPPORTED_LANGUAGES,
  ThemeMode,
  TranslationProvider,
  SelectionTriggerMode,
  HighlightColor,
  ExtensionSettings,
} from '../shared/storage';
import { useExtensionSettings, useThemeSync } from '../shared/storageHooks';
import { openSidePanelFromWindow } from '../shared/messaging';
import { exportVocabToExcel } from '../shared/excelExport';

export const OptionsApp: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { settings, saveSettings, restoreDefaults } = useExtensionSettings();
  useThemeSync(settings);

  const [activeTab, setActiveTab] = useState<
    'translator' | 'general' | 'appearance' | 'storage' | 'browsers'
  >('translator');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const allWords = useMemo(() => getAllVocabItems(settings), [settings]);

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

  const handleExportExcel = () => {
    exportVocabToExcel(allWords, 'project-x-all-vocabulary.xlsx');
    notify(`Exported ${allWords.length} word(s) to Excel (.xlsx)`);
  };

  const handleReset = async () => {
    await restoreDefaults();
    notify('Settings restored to default values');
  };

  return (
    <div
      style={{
        minHeight: embedded ? '100%' : '100vh',
        backgroundColor: 'var(--clay-canvas)',
        color: 'var(--clay-text-primary)',
        display: 'flex',
        flexDirection: 'column',
        padding: embedded ? '16px' : '20px 28px',
        gap: 20,
      }}
    >
      {/* Top 3D Clay Header Card */}
      <header
        className="clay-card"
        style={{
          padding: '16px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: 'var(--clay-accent-gradient)',
              boxShadow: 'var(--clay-accent-shadow)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800 }}>
              Project X — Extension Options
            </h1>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--clay-text-muted)' }}>
              Claymorphism Web Translator, CSS <code>::highlight()</code> Engine & Excel Exporter
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {statusBanner && (
            <span className="clay-badge" style={{ padding: '6px 12px', fontSize: 12 }}>
              <CheckCircle2 size={14} />
              {statusBanner}
            </span>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportExcel}
            disabled={allWords.length === 0}
          >
            <FileSpreadsheet size={15} />
            <span>Export All Excel ({allWords.length})</span>
          </button>
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
          maxWidth: 980,
          width: '100%',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: embedded ? '200px 1fr' : '230px 1fr',
          gap: 20,
          flex: 1,
        }}
      >
        {/* Clay Sidebar Navigation */}
        <aside
          className="clay-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: 12,
            alignSelf: 'start',
          }}
        >
          <button
            type="button"
            className={activeTab === 'translator' ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
            onClick={() => setActiveTab('translator')}
          >
            <Languages size={16} />
            <span>Translator & Highlight</span>
          </button>
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
            <span>Claymorphism Theme</span>
          </button>
          <button
            type="button"
            className={activeTab === 'storage' ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
            onClick={() => setActiveTab('storage')}
          >
            <Database size={16} />
            <span>Storage & Excel</span>
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
          {activeTab === 'translator' && (
            <div className="clay-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
                  Translation Provider & CSS <code>::highlight()</code> Settings
                </h2>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--clay-text-muted)' }}>
                  Configure how selected text is translated, highlighted on the page, and saved by URL.
                </p>
              </div>

              {/* Target Language */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 800 }}>
                  Target Translation Language
                </label>
                <select
                  className="clay-input"
                  style={{ maxWidth: 320, cursor: 'pointer' }}
                  value={settings.targetLang}
                  onChange={(e) => {
                    saveSettings({ targetLang: e.target.value });
                    notify(`Target language set to ${e.target.value.toUpperCase()}`);
                  }}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Translation Provider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>Translation Engine</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(
                    [
                      { id: 'google', label: 'Free Google Translate (Default)' },
                      { id: 'gemini', label: 'Gemini API' },
                      { id: 'openai', label: 'OpenAI GPT-4o-mini' },
                      { id: 'deepl', label: 'DeepL API' },
                    ] as Array<{ id: TranslationProvider; label: string }>
                  ).map((prov) => (
                    <button
                      key={prov.id}
                      type="button"
                      className={
                        settings.translationProvider === prov.id
                          ? 'btn btn-primary'
                          : 'btn btn-secondary'
                      }
                      onClick={() => {
                        saveSettings({ translationProvider: prov.id });
                        notify(`Translation engine set to ${prov.label}`);
                      }}
                    >
                      {prov.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional API Key */}
              {settings.translationProvider !== 'google' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 800 }}>
                    {settings.translationProvider.toUpperCase()} API Key (falls back to Free Google Translate if empty)
                  </label>
                  <input
                    type="password"
                    className="clay-input"
                    placeholder={`Enter your ${settings.translationProvider} API key...`}
                    value={settings.apiKey}
                    onChange={(e) => saveSettings({ apiKey: e.target.value })}
                  />
                </div>
              )}

              {/* Selection Trigger Mode */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>
                  When Selecting Text on a Webpage
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {(
                    [
                      {
                        id: 'auto',
                        title: 'Auto-Translate, Auto-Highlight & Auto-Save (Recommended)',
                        desc: 'Immediately shows the Claymorphism translation popup, highlights all occurrences on the page, and saves to URL storage.',
                      },
                      {
                        id: 'icon',
                        title: 'Show Floating 3D Clay Icon First',
                        desc: 'Displays a compact ✨ clay icon near the selection; click it to translate, highlight, and save.',
                      },
                      {
                        id: 'manual',
                        title: 'Show Popup Immediately, Save Only When Clicking Button',
                        desc: 'Translates immediately on selection, and highlights/saves when you click "Save & Highlight".',
                      },
                    ] as Array<{ id: SelectionTriggerMode; title: string; desc: string }>
                  ).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        saveSettings({
                          selectionMode: m.id,
                          autoTranslateOnSelect: m.id === 'auto',
                        });
                        notify(`Selection mode updated to ${m.id}`);
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 16,
                        cursor: 'pointer',
                        backgroundColor:
                          settings.selectionMode === m.id
                            ? 'var(--clay-surface-tinted)'
                            : 'var(--clay-recessed)',
                        boxShadow:
                          settings.selectionMode === m.id
                            ? 'var(--clay-shadow-sm)'
                            : 'var(--clay-shadow-inset)',
                        border:
                          settings.selectionMode === m.id
                            ? '2px solid var(--accent-primary)'
                            : '2px solid transparent',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 800 }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--clay-text-muted)' }}>
                        {m.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CSS ::highlight() Color Swatch */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>
                  Webpage <code>::highlight(project-x-vocab)</code> Color
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {(
                    [
                      { id: 'yellow', label: 'Sunny Yellow', hex: '#eab308' },
                      { id: 'emerald', label: 'Mint Emerald', hex: '#10b981' },
                      { id: 'sky', label: 'Sky Blue', hex: '#0ea5e9' },
                      { id: 'rose', label: 'Coral Rose', hex: '#f43f5e' },
                    ] as Array<{ id: HighlightColor; label: string; hex: string }>
                  ).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={
                        settings.highlightColor === c.id
                          ? 'btn btn-primary'
                          : 'btn btn-secondary'
                      }
                      onClick={() => {
                        saveSettings({ highlightColor: c.id });
                        notify(`Highlight color set to ${c.label}`);
                      }}
                    >
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: c.hex,
                          border: '2px solid #fff',
                        }}
                      />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="clay-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
                  Side Panel & Browser Integration
                </h2>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--clay-text-muted)' }}>
                  Changes sync automatically across Side Panel, Popup, and active webpage Content Scripts.
                </p>
              </div>

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
                  <div style={{ fontSize: 14, fontWeight: 800 }}>
                    Open Side Panel on Extension Icon Click
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--clay-text-muted)' }}>
                    When enabled, clicking the extension icon opens the Side Panel directly to view all highlighted words on the current page.
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

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>
                    Right-Click Context Menu Translation
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--clay-text-muted)' }}>
                    Adds &ldquo;Translate & Highlight with Project X&rdquo; to the browser right-click menu.
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.enableContextMenu}
                    onChange={(e) => {
                      saveSettings({ enableContextMenu: e.target.checked });
                      notify('Updated context menu preference');
                    }}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="clay-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
                  Soft Pastel Claymorphism & Dark Clay Theme
                </h2>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--clay-text-muted)' }}>
                  Customize the 3D Claymorphism palette across the Side Panel, Popup, Options Page, and On-Page Shadow DOM Popups.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>Clay Surface Mode</div>
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
                      style={{ textTransform: 'capitalize', minWidth: 110 }}
                      onClick={() => {
                        saveSettings({ theme: mode });
                        notify(`Theme set to ${mode}`);
                      }}
                    >
                      {mode === 'light'
                        ? 'Pastel Clay (Light)'
                        : mode === 'dark'
                        ? 'Dark Clay'
                        : 'System Auto'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>3D Clay Accent Palette</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {(
                    [
                      { id: 'indigo', label: 'Indigo Clay', hex: '#6366f1' },
                      { id: 'emerald', label: 'Mint Emerald', hex: '#10b981' },
                      { id: 'rose', label: 'Coral Rose', hex: '#f43f5e' },
                      { id: 'amber', label: 'Honey Amber', hex: '#f59e0b' },
                    ] as const
                  ).map((swatch) => (
                    <button
                      key={swatch.id}
                      type="button"
                      className={
                        settings.accentColor === swatch.id
                          ? 'btn btn-primary'
                          : 'btn btn-secondary'
                      }
                      onClick={() => {
                        saveSettings({
                          accentColor: swatch.id as ExtensionSettings['accentColor'],
                        });
                        notify(`Accent updated to ${swatch.label}`);
                      }}
                    >
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: swatch.hex,
                          border: '2px solid #fff',
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
            <div className="clay-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
                  Local Vocabulary Storage & Excel (`.xlsx`) Export
                </h2>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--clay-text-muted)' }}>
                  Currently storing <strong>{allWords.length}</strong> highlighted word(s) across{' '}
                  <strong>{Object.keys(settings.vocabByUrl || {}).length}</strong> webpage URL(s).
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExportExcel}
                  disabled={allWords.length === 0}
                >
                  <FileSpreadsheet size={15} />
                  <span>Export All to Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleExportJson}
                >
                  <Download size={14} />
                  <span>Backup Raw JSON</span>
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

              <pre
                style={{
                  backgroundColor: 'var(--clay-recessed)',
                  boxShadow: 'var(--clay-shadow-inset)',
                  padding: 14,
                  borderRadius: 16,
                  fontSize: 11,
                  overflowX: 'auto',
                  maxHeight: 260,
                }}
              >
                {JSON.stringify(settings.vocabByUrl, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'browsers' && (
            <div className="clay-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>
                Cross-Browser Installation Guide
              </h2>
              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: 'var(--clay-recessed)',
                  boxShadow: 'var(--clay-shadow-inset)',
                  fontSize: 12,
                }}
              >
                <strong>1. Chrome / Edge / Brave (Manifest V3)</strong>: Run{' '}
                <code>npm run build</code>, open <code>chrome://extensions</code>, enable{' '}
                <strong>Developer mode</strong>, click <strong>Load unpacked</strong>, and select{' '}
                <code>dist/</code>.
              </div>
              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: 'var(--clay-recessed)',
                  boxShadow: 'var(--clay-shadow-inset)',
                  fontSize: 12,
                }}
              >
                <strong>2. Firefox (WebExtensions MV3)</strong>: Open{' '}
                <code>about:debugging#/runtime/this-firefox</code>, click{' '}
                <strong>Load Temporary Add-on</strong>, and select{' '}
                <code>dist/manifest.json</code>.
              </div>
              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: 'var(--clay-recessed)',
                  boxShadow: 'var(--clay-shadow-inset)',
                  fontSize: 12,
                }}
              >
                <strong>3. Safari (macOS / iOS)</strong>: Run{' '}
                <code>xcrun safari-web-extension-converter dist/</code>.
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
