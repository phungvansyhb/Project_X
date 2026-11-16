import React from 'react';
import { PanelRight, Settings, Layers, Sparkles } from 'lucide-react';
import { useExtensionSettings, useThemeSync } from '../shared/storage';
import { openOptionsPage, openSidePanelFromWindow } from '../shared/messaging';

export const PopupApp: React.FC = () => {
  const { settings } = useExtensionSettings();
  useThemeSync(settings);

  return (
    <div
      style={{
        width: 320,
        padding: 16,
        backgroundColor: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            }}
          >
            <Layers size={16} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Project X</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Quick Launcher
            </div>
          </div>
        </div>
        <span className="badge">
          <Sparkles size={11} />
          MV3
        </span>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
        You have <strong>{settings.notes.length}</strong> saved note(s) in storage. Launch the Side Panel or configure preferences in Options.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => openSidePanelFromWindow()}
        >
          <PanelRight size={15} />
          <span>Open Side Panel</span>
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => openOptionsPage()}
        >
          <Settings size={15} />
          <span>Extension Options</span>
        </button>
      </div>
    </div>
  );
};
