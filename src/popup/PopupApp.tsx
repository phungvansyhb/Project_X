import React, { useEffect, useState, useMemo } from 'react';
import {
  PanelRight,
  Settings,
  Layers,
  Sparkles,
  FileSpreadsheet,
  Volume2,
  Crosshair,
  Trash2,
} from 'lucide-react';
import {
  getVocabForPage,
  getAllVocabItems,
  removeVocabItem,
} from '../shared/storage';
import { useExtensionSettings, useThemeSync } from '../shared/storageHooks';
import {
  getActiveTabInfo,
  openOptionsPage,
  openSidePanelFromWindow,
  scrollToVocabOnPage,
  ActiveTabInfo,
} from '../shared/messaging';
import { exportVocabToExcel } from '../shared/excelExport';

export const PopupApp: React.FC = () => {
  const { settings } = useExtensionSettings();
  useThemeSync(settings);

  const [activeTab, setActiveTab] = useState<ActiveTabInfo | null>(null);

  useEffect(() => {
    getActiveTabInfo().then(setActiveTab);
  }, []);

  const currentPageWords = useMemo(
    () => getVocabForPage(settings, activeTab?.url),
    [settings, activeTab?.url]
  );

  const allWords = useMemo(() => getAllVocabItems(settings), [settings]);

  return (
    <div
      style={{
        width: 360,
        padding: 14,
        backgroundColor: 'var(--clay-canvas)',
        color: 'var(--clay-text-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Header Clay Card */}
      <div
        className="clay-card"
        style={{
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 11,
              background: 'var(--clay-accent-gradient)',
              boxShadow: 'var(--clay-accent-shadow)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={17} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Project X Vocab</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clay-text-muted)' }}>
              {currentPageWords.length} word(s) on this page
            </div>
          </div>
        </div>
        <span className="clay-badge">
          <Sparkles size={11} />
          {settings.targetLang.toUpperCase()}
        </span>
      </div>

      {/* Current Page Highlighted Words Preview */}
      <div
        style={{
          maxHeight: 240,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          paddingRight: 2,
        }}
      >
        {currentPageWords.length === 0 ? (
          <div
            className="clay-card"
            style={{
              padding: '18px 14px',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--clay-text-muted)',
            }}
          >
            Select any text on this webpage to translate, highlight with{' '}
            <code>::highlight()</code>, and auto-save!
          </div>
        ) : (
          currentPageWords.map((item) => (
            <div
              key={item.id}
              className="clay-card"
              style={{
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 800 }}>{item.sourceText}</span>
                  {item.phonetic && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--clay-text-muted)',
                        fontFamily: "'Lucida Sans Unicode', 'DejaVu Sans', sans-serif",
                      }}
                    >
                      {item.phonetic}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: 5, borderRadius: 8 }}
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.speak(
                          new SpeechSynthesisUtterance(item.sourceText)
                        );
                      }
                    }}
                    title="Pronounce"
                  >
                    <Volume2 size={12} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: 5, borderRadius: 8 }}
                    onClick={() => scrollToVocabOnPage(item.sourceText)}
                    title="Scroll to word on page"
                  >
                    <Crosshair size={12} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: 5, borderRadius: 8, color: 'var(--danger)' }}
                    onClick={() => removeVocabItem(item.pageUrl, item.sourceText)}
                    title="Remove highlight"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--clay-text-secondary)',
                  backgroundColor: 'var(--clay-recessed)',
                  padding: '6px 10px',
                  borderRadius: 10,
                }}
              >
                {item.translatedText}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            exportVocabToExcel(
              currentPageWords.length > 0 ? currentPageWords : allWords,
              'project-x-vocabulary.xlsx'
            )
          }
          disabled={currentPageWords.length === 0 && allWords.length === 0}
        >
          <FileSpreadsheet size={14} />
          <span>Export Excel</span>
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => openSidePanelFromWindow()}
        >
          <PanelRight size={14} />
          <span>Side Panel</span>
        </button>
      </div>

      <button
        type="button"
        className="btn btn-secondary"
        style={{ width: '100%' }}
        onClick={() => openOptionsPage()}
      >
        <Settings size={14} />
        <span>Extension Options ({allWords.length} total saved)</span>
      </button>
    </div>
  );
};
