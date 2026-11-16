import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { SidePanelApp } from '../sidepanel/SidePanelApp';
import { OptionsApp } from '../options/OptionsApp';
import { PopupApp } from '../popup/PopupApp';
import '../shared/styles.css';

const DevWorkbench: React.FC = () => {
  const [viewMode, setViewMode] = useState<'split' | 'sidepanel' | 'options' | 'popup'>('split');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dev Switcher Bar */}
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          borderBottom: '1px solid #1e293b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              backgroundColor: '#6366f1',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: 4,
              fontWeight: 600,
              fontSize: 11,
            }}
          >
            DEV WORKBENCH
          </span>
          <span style={{ color: '#94a3b8' }}>
            Preview Side Panel & Options Page with live synced storage
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {(
            [
              { id: 'split', label: 'Split View (Options + Side Panel)' },
              { id: 'sidepanel', label: 'Side Panel Only' },
              { id: 'options', label: 'Options Page Only' },
              { id: 'popup', label: 'Popup Launcher' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setViewMode(tab.id)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid',
                borderColor: viewMode === tab.id ? '#6366f1' : '#334155',
                backgroundColor: viewMode === tab.id ? '#4f46e5' : '#1e293b',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Preview Container */}
      {viewMode === 'split' && (
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            minHeight: 'calc(100vh - 43px)',
          }}
        >
          <div style={{ borderRight: '2px solid var(--border-color)', overflowY: 'auto' }}>
            <OptionsApp embedded />
          </div>
          <div style={{ overflowY: 'auto' }}>
            <SidePanelApp embedded />
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
            backgroundColor: 'var(--bg-elevated)',
          }}
        >
          <div
            style={{
              width: 380,
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
            }}
          >
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
            alignItems: ' flex-start',
            justifyContent: 'center',
            padding: 48,
            backgroundColor: 'var(--bg-elevated)',
          }}
        >
          <div
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <PopupApp />
          </div>
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
