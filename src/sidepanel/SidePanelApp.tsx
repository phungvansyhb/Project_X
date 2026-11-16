import React, { useState, useEffect, useMemo } from 'react';
import {
  Settings,
  Sparkles,
  Trash2,
  Globe,
  RefreshCw,
  Volume2,
  Crosshair,
  FileSpreadsheet,
  Search,
  Edit3,
  Check,
  X,
  Plus,
  BookOpen,
  Layers,
} from 'lucide-react';
import {
  useExtensionSettings,
  useThemeSync,
  getVocabForPage,
  getAllVocabItems,
  removeVocabItem,
  updateVocabItemMeaning,
  clearPageVocab,
  SUPPORTED_LANGUAGES,
  VocabItem,
} from '../shared/storage';
import {
  getActiveTabInfo,
  openOptionsPage,
  requestTranslation,
  scrollToVocabOnPage,
  ActiveTabInfo,
} from '../shared/messaging';
import { exportVocabToExcel } from '../shared/excelExport';

function speakWord(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis errors
    }
  }
}

export const SidePanelApp: React.FC<{
  embedded?: boolean;
  onOpenOptions?: () => void;
}> = ({ embedded = false, onOpenOptions }) => {
  const { settings, saveSettings } = useExtensionSettings();
  useThemeSync(settings);

  const [activeTab, setActiveTab] = useState<ActiveTabInfo | null>(null);
  const [viewTab, setViewTab] = useState<'current' | 'all'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickInput, setQuickInput] = useState('');
  const [translatingQuick, setTranslatingQuick] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingMeaning, setEditingMeaning] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  const refreshTabInfo = async () => {
    const info = await getActiveTabInfo();
    setActiveTab(info);
  };

  useEffect(() => {
    refreshTabInfo();
  }, []);

  const currentPageWords = useMemo(
    () => getVocabForPage(settings, activeTab?.url),
    [settings, activeTab?.url]
  );

  const allWords = useMemo(() => getAllVocabItems(settings), [settings]);

  const displayedWords = useMemo(() => {
    const base = viewTab === 'current' ? currentPageWords : allWords;
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(
      (item) =>
        item.sourceText.toLowerCase().includes(q) ||
        item.translatedText.toLowerCase().includes(q) ||
        item.pageTitle.toLowerCase().includes(q)
    );
  }, [viewTab, currentPageWords, allWords, searchQuery]);

  const handleQuickTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = quickInput.trim();
    if (!text || translatingQuick) return;

    setTranslatingQuick(true);
    const res = await requestTranslation({
      text,
      pageUrl: activeTab?.url,
      pageTitle: activeTab?.title,
      autoSave: true,
    });
    setTranslatingQuick(false);

    if (res.ok) {
      setQuickInput('');
      showToast(`Highlighted & saved "${text}"`);
    }
  };

  const handleDeleteWord = async (item: VocabItem) => {
    await removeVocabItem(item.pageUrl, item.sourceText);
    showToast(`Removed "${item.sourceText}"`);
  };

  const handleSaveEdit = async (item: VocabItem) => {
    if (!editingMeaning.trim()) return;
    await updateVocabItemMeaning(item.pageUrl, item.id, editingMeaning);
    setEditingId(null);
    showToast('Updated meaning');
  };

  const handleExportExcel = () => {
    const targetList = viewTab === 'current' ? currentPageWords : allWords;
    if (targetList.length === 0) {
      showToast('No words to export yet');
      return;
    }
    const suffix = viewTab === 'current' ? 'current-page' : 'all-pages';
    exportVocabToExcel(
      targetList,
      `project-x-vocab-${suffix}-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showToast(`Exported ${targetList.length} word(s) to Excel (.xlsx)`);
  };

  const handleOptionsClick = () => {
    if (onOpenOptions) {
      onOpenOptions();
    } else {
      openOptionsPage();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: embedded ? '100%' : '100vh',
        backgroundColor: 'var(--clay-canvas)',
        color: 'var(--clay-text-primary)',
        padding: '12px 14px',
        gap: 12,
      }}
    >
      {/* Floating 3D Clay Header Card */}
      <header
        className="clay-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderRadius: 'var(--clay-radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: 'var(--clay-accent-gradient)',
              boxShadow: 'var(--clay-accent-shadow)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
            }}
          >
            <Layers size={18} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>
              Project X Vocab
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clay-text-muted)' }}>
              Select • Highlight • Hover • Export
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <select
            className="clay-input"
            value={settings.targetLang}
            onChange={(e) => saveSettings({ targetLang: e.target.value })}
            title="Target translation language"
            style={{
              width: 'auto',
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 800,
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.code.toUpperCase()}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleOptionsClick}
            title="Open Extension Options"
            style={{ padding: '7px 10px', borderRadius: 12 }}
          >
            <Settings size={14} />
          </button>
        </div>
      </header>

      {toastMsg && (
        <div
          className="clay-badge"
          style={{
            justifyContent: 'center',
            padding: '8px 14px',
            fontSize: 12,
            width: '100%',
          }}
        >
          <Sparkles size={13} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Active Webpage Summary Clay Card */}
      <div className="clay-card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="clay-badge">
            <Globe size={12} />
            <span>Current Page URL</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--clay-text-muted)' }}>
              {currentPageWords.length} highlighted
            </span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={refreshTabInfo}
              title="Refresh active tab"
              style={{ padding: 4 }}
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activeTab?.title || 'Active Web Article'}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--clay-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activeTab?.normalizedUrl || 'https://developer.chrome.com/docs/extensions'}
          </div>
        </div>

        {/* Quick Translate & Highlight Form */}
        <form onSubmit={handleQuickTranslate} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            className="clay-input"
            placeholder="Type a word/phrase to translate & highlight..."
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', fontSize: 12 }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={translatingQuick}
            style={{ padding: '8px 12px', flexShrink: 0 }}
          >
            <Plus size={14} />
            <span>{translatingQuick ? '...' : 'Add'}</span>
          </button>
        </form>
      </div>

      {/* Recessed Clay Segmented Switcher */}
      <div className="clay-recessed-track" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <button
          type="button"
          className={viewTab === 'current' ? 'btn btn-primary' : 'btn btn-ghost'}
          onClick={() => setViewTab('current')}
          style={{ borderRadius: 14, padding: '8px 10px', fontSize: 12 }}
        >
          <BookOpen size={14} />
          <span>This Page ({currentPageWords.length})</span>
        </button>
        <button
          type="button"
          className={viewTab === 'all' ? 'btn btn-primary' : 'btn btn-ghost'}
          onClick={() => setViewTab('all')}
          style={{ borderRadius: 14, padding: '8px 10px', fontSize: 12 }}
        >
          <Globe size={14} />
          <span>All Pages ({allWords.length})</span>
        </button>
      </div>

      {/* Search & Export Action Row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--clay-text-muted)',
            }}
          />
          <input
            type="text"
            className="clay-input"
            placeholder="Search highlighted words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 32, paddingRight: 10, paddingTop: 8, paddingBottom: 8, fontSize: 12 }}
          />
        </div>

        <button
          type="button"
          className="btn btn-emerald"
          onClick={handleExportExcel}
          title="Export words to Excel (.xlsx) with Source Text & Translated Meaning"
          style={{ padding: '8px 13px', fontSize: 12, flexShrink: 0 }}
        >
          <FileSpreadsheet size={15} />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Highlighted Words List */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {displayedWords.length === 0 ? (
          <div
            className="clay-card"
            style={{
              textAlign: 'center',
              padding: '28px 16px',
              color: 'var(--clay-text-muted)',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Sparkles size={22} style={{ marginBottom: 8, color: 'var(--accent-primary)' }} />
            <div>
              {viewTab === 'current'
                ? 'No words highlighted on this page yet. Select any text on the page to translate & highlight!'
                : 'No saved vocabulary matching your search.'}
            </div>
          </div>
        ) : (
          displayedWords.map((item) => (
            <div
              key={item.id}
              className="clay-card"
              style={{
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: 'var(--clay-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.sourceText}
                  </span>
                  <span className="clay-badge" style={{ fontSize: 10, padding: '2px 7px' }}>
                    {item.targetLang.toUpperCase()}
                  </span>
                </div>

                {/* Tactile Clay Micro-Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: 6, borderRadius: 10 }}
                    onClick={() => speakWord(item.sourceText)}
                    title="Pronounce word"
                  >
                    <Volume2 size={13} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: 6, borderRadius: 10 }}
                    onClick={() => scrollToVocabOnPage(item.sourceText)}
                    title="Scroll to highlighted word on page"
                  >
                    <Crosshair size={13} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: 6, borderRadius: 10 }}
                    onClick={() => {
                      setEditingId(item.id);
                      setEditingMeaning(item.translatedText);
                    }}
                    title="Edit translated meaning"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: 6, borderRadius: 10, color: 'var(--danger)' }}
                    onClick={() => handleDeleteWord(item)}
                    title="Remove highlight & delete word"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Translated Meaning Box or Inline Edit */}
              {editingId === item.id ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="text"
                    className="clay-input"
                    value={editingMeaning}
                    onChange={(e) => setEditingMeaning(e.target.value)}
                    style={{ flex: 1, padding: '6px 10px', fontSize: 12 }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '6px 10px' }}
                    onClick={() => handleSaveEdit(item)}
                  >
                    <Check size={13} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px' }}
                    onClick={() => setEditingId(null)}
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: 'var(--clay-recessed)',
                    boxShadow: 'var(--clay-shadow-inset)',
                    borderRadius: 12,
                    padding: '8px 12px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--clay-text-secondary)',
                  }}
                >
                  {item.translatedText}
                </div>
              )}

              {viewTab === 'all' && (
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--clay-text-muted)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    📄 {item.pageTitle || item.pageUrl}
                  </span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))
        )}
      </main>

      {/* Bottom Clay Footer */}
      <footer
        className="clay-card"
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--clay-text-muted)',
        }}
      >
        <span>CSS ::highlight() Active</span>
        {viewTab === 'current' && currentPageWords.length > 0 ? (
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '2px 8px', fontSize: 11, color: 'var(--danger)' }}
            onClick={async () => {
              if (activeTab?.url) {
                await clearPageVocab(activeTab.url);
                showToast('Cleared page highlights');
              }
            }}
          >
            Clear Page
          </button>
        ) : (
          <span>Total Saved: {allWords.length}</span>
        )}
      </footer>
    </div>
  );
};
