import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  Plus,
  Trash2,
  Globe,
  Highlighter,
  RefreshCw,
  Check,
  ExternalLink,
  BookOpen,
  Layers,
} from 'lucide-react';
import {
  useExtensionSettings,
  useThemeSync,
  QuickNote,
} from '../shared/storage';
import {
  getActiveTabInfo,
  triggerPageHighlight,
  openOptionsPage,
  ActiveTabInfo,
} from '../shared/messaging';

export const SidePanelApp: React.FC<{ embedded?: boolean; onOpenOptions?: () => void }> = ({
  embedded = false,
  onOpenOptions,
}) => {
  const { settings, saveSettings } = useExtensionSettings();
  useThemeSync(settings);

  const [activeTab, setActiveTab] = useState<ActiveTabInfo | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [highlighted, setHighlighted] = useState(false);
  const [activeSection, setActiveSection] = useState<'workspace' | 'inspector'>('workspace');

  const refreshTabInfo = async () => {
    const info = await getActiveTabInfo();
    setActiveTab(info);
  };

  useEffect(() => {
    refreshTabInfo();
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;

    const newNote: QuickNote = {
      id: `note-${Date.now()}`,
      title: noteTitle.trim() || 'Untitled Note',
      content: noteContent.trim(),
      url: activeTab?.url,
      createdAt: Date.now(),
    };

    await saveSettings({
      notes: [newNote, ...settings.notes],
    });
    setNoteTitle('');
    setNoteContent('');
  };

  const handleDeleteNote = async (id: string) => {
    await saveSettings({
      notes: settings.notes.filter((n) => n.id !== id),
    });
  };

  const handleHighlight = async () => {
    await triggerPageHighlight(settings.accentColor);
    setHighlighted(true);
    setTimeout(() => setHighlighted(false), 1800);
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
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor: 'var(--accent-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            <Layers size={16} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
              Project X
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Side Panel Companion
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleOptionsClick}
          title="Open Extension Options"
          style={{ padding: '6px 10px' }}
        >
          <Settings size={14} />
          <span>Options</span>
        </button>
      </header>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          padding: '10px 16px 0',
        }}
      >
        <button
          type="button"
          className={activeSection === 'workspace' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setActiveSection('workspace')}
        >
          <BookOpen size={14} />
          <span>Quick Notes ({settings.notes.length})</span>
        </button>
        <button
          type="button"
          className={activeSection === 'inspector' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => {
            setActiveSection('inspector');
            refreshTabInfo();
          }}
        >
          <Globe size={14} />
          <span>Page Context</span>
        </button>
      </div>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* Active Page Banner */}
        <div className="card" style={{ padding: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <span className="badge">
              <Sparkles size={11} />
              Active Tab
            </span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={refreshTabInfo}
              title="Refresh active tab info"
              style={{ padding: 4 }}
            >
              <RefreshCw size={13} />
            </button>
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activeTab?.title || 'Detecting active tab...'}
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: 10,
            }}
          >
            {activeTab?.url || 'chrome://newtab'}
          </div>

          {settings.enablePageHighlighter && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={handleHighlight}
            >
              {highlighted ? <Check size={14} /> : <Highlighter size={14} />}
              <span>
                {highlighted ? 'Page Headings Highlighted!' : 'Highlight Page Headings'}
              </span>
            </button>
          )}
        </div>

        {activeSection === 'workspace' ? (
          <>
            {/* Add Quick Note Form */}
            <form onSubmit={handleAddNote} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Capture Page Note
              </div>
              <input
                type="text"
                className="input"
                placeholder="Note title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              <textarea
                className="textarea"
                rows={3}
                placeholder="Write a snippet, checklist, or takeaway from this page..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                <Plus size={14} />
                <span>Save to Extension Storage</span>
              </button>
            </form>

            {/* Saved Notes List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {settings.notes.length === 0 ? (
                <div
                  className="card"
                  style={{
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                    padding: '24px 16px',
                  }}
                >
                  No notes saved yet. Add your first note above!
                </div>
              ) : (
                settings.notes.map((note) => (
                  <div
                    key={note.id}
                    className="card"
                    style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 12 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{note.title}</div>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => handleDeleteNote(note.id)}
                        style={{ padding: 4, color: 'var(--danger)' }}
                        title="Delete note"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {note.content}
                    </p>
                    {note.url && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 4,
                          paddingTop: 6,
                          borderTop: '1px solid var(--border-color)',
                          fontSize: 11,
                          color: 'var(--text-muted)',
                        }}
                      >
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        <a
                          href={note.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            color: 'var(--accent-primary)',
                            textDecoration: 'none',
                          }}
                        >
                          <span>Source</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Page Context Inspector */
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Content Script Metrics</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              <div
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-elevated)',
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Word Count</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  {activeTab?.wordCount ?? '—'}
                </div>
              </div>
              <div
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-elevated)',
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Headings</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  {activeTab?.headingCount ?? '—'}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: 12,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-elevated)',
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Current Preferences</div>
              <div style={{ color: 'var(--text-secondary)' }}>
                • Theme: <strong>{settings.theme}</strong>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                • Accent: <strong>{settings.accentColor}</strong>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                • Toolbar Click Opens Side Panel:{' '}
                <strong>{settings.openPanelOnActionClick ? 'Yes' : 'No (Popup)'}</strong>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}
      >
        <span>Manifest V3 • Cross-Browser</span>
        <span>Shortcut: {settings.customShortcutHint}</span>
      </footer>
    </div>
  );
};
