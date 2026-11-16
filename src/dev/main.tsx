import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { SidePanelApp } from '../sidepanel/SidePanelApp';
import { OptionsApp } from '../options/OptionsApp';
import { PopupApp } from '../popup/PopupApp';
import { initContentHighlighter } from '../content/index';
import '../shared/styles.css';

const InteractiveArticleSimulator: React.FC = () => {
  const articleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (articleRef.current) {
      initContentHighlighter(articleRef.current);
    }
  }, []);

  return (
    <div
      style={{
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div
        className="clay-card"
        style={{
          padding: '14px 18px',
          background: 'var(--clay-accent-gradient)',
          color: '#ffffff',
          boxShadow: 'var(--clay-accent-shadow)',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>
          ✨ Interactive Reading & Highlight Simulator
        </div>
        <div style={{ fontSize: 12, opacity: 0.95 }}>
          1. <strong>Select any word or phrase</strong> in the article below to trigger the{' '}
          <strong>Shadow DOM Claymorphism Popup Translator</strong>.<br />
          2. Notice how all occurrences are automatically highlighted with{' '}
          <code>::highlight(project-x-vocab)</code> and saved to the Side Panel on the right.<br />
          3. <strong>Hover your mouse</strong> over any highlighted word to see its meaning tooltip!
        </div>
      </div>

      <article
        ref={articleRef}
        data-px-article="true"
        className="clay-card"
        style={{
          padding: '28px 32px',
          lineHeight: 1.8,
          fontSize: 15,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>
          Modern Browser Extension Architecture with Manifest V3 & Claymorphism
        </h1>
        <p>
          Building a cross-browser <strong>extension</strong> with <strong>Manifest V3</strong>{' '}
          allows developers to ship a single codebase across Chrome, Edge, Brave, Firefox, and
          Safari. By combining a persistent <strong>Side Panel</strong> with an isolated{' '}
          <strong>Shadow DOM</strong> overlay, users can read any article on the web and build
          their personal <strong>vocabulary</strong> effortlessly.
        </p>
        <p>
          Traditional web highlighters mutate webpage DOM trees by injecting wrapper tags, which
          frequently breaks modern reactive frameworks. Instead, Project X leverages the native{' '}
          <strong>Custom Highlight API</strong> (<code>CSS.highlights</code>) to style text ranges
          directly through CSS without modifying a single DOM node.
        </p>
        <p>
          Every time you select a word to <strong>translate</strong> and <strong>highlight</strong>{' '}
          on this page, the <strong>Service Worker</strong> and <strong>Content Script</strong>{' '}
          synchronize your saved words into local machine <strong>storage</strong> indexed by page
          URL. Visually, the interface embraces <strong>Claymorphism</strong>—pairing soft pastel
          surfaces, rounded geometry, and three-dimensional inner highlights.
        </p>
      </article>
    </div>
  );
};

const DevWorkbench: React.FC = () => {
  const [viewMode, setViewMode] = useState<
    'simulator' | 'split' | 'sidepanel' | 'options' | 'popup'
  >('simulator');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Dev Switcher Bar */}
      <div
        style={{
          backgroundColor: '#13111c',
          color: '#f8fafc',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          fontSize: 12,
          borderBottom: '1px solid #2e294e',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              background: 'linear-gradient(145deg, #818cf8 0%, #6366f1 100%)',
              color: '#fff',
              padding: '3px 10px',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 11,
            }}
          >
            CLAYMORPHISM WORKBENCH
          </span>
          <span style={{ color: '#c4b5fd', fontWeight: 600 }}>
            Select text • CSS ::highlight() • Hover meaning • Excel (.xlsx) Export
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(
            [
              { id: 'simulator', label: '✨ Live Web Reader + Side Panel' },
              { id: 'split', label: 'Options + Side Panel' },
              { id: 'sidepanel', label: 'Side Panel Only' },
              { id: 'options', label: 'Options Page' },
              { id: 'popup', label: 'Popup Launcher' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setViewMode(tab.id)}
              style={{
                padding: '5px 12px',
                borderRadius: 999,
                border: '1px solid',
                borderColor: viewMode === tab.id ? '#818cf8' : '#334155',
                backgroundColor: viewMode === tab.id ? '#4f46e5' : '#1e1b2e',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Preview Container */}
      {viewMode === 'simulator' && (
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            minHeight: 'calc(100vh - 49px)',
          }}
        >
          <div style={{ borderRight: '2px solid var(--border-color)', overflowY: 'auto' }}>
            <InteractiveArticleSimulator />
          </div>
          <div style={{ overflowY: 'auto' }}>
            <SidePanelApp embedded onOpenOptions={() => setViewMode('options')} />
          </div>
        </div>
      )}

      {viewMode === 'split' && (
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            minHeight: 'calc(100vh - 49px)',
          }}
        >
          <div style={{ borderRight: '2px solid var(--border-color)', overflowY: 'auto' }}>
            <OptionsApp embedded />
          </div>
          <div style={{ overflowY: 'auto' }}>
            <SidePanelApp embedded onOpenOptions={() => setViewMode('options')} />
          </div>
        </div>
      )}

      {viewMode === 'sidepanel' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div style={{ width: 400 }}>
            <SidePanelApp embedded onOpenOptions={() => setViewMode('options')} />
          </div>
        </div>
      )}

      {viewMode === 'options' && <OptionsApp embedded />}

      {viewMode === 'popup' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: 36,
          }}
        >
          <PopupApp />
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DevWorkbench />
  </React.StrictMode>
);
