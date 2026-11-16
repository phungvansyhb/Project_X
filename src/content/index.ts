import { getExtensionApi } from '../shared/storage';

const api = getExtensionApi();

const ACCENT_MAP: Record<string, string> = {
  indigo: '#6366f1',
  emerald: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
};

if (api?.runtime?.onMessage) {
  api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'GET_PAGE_METRICS') {
      const text = document.body?.innerText || '';
      const words = text
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      const headings = document.querySelectorAll('h1, h2, h3').length;
      const selectionText = window.getSelection()?.toString() || '';

      sendResponse({
        wordCount: words,
        headingCount: headings,
        selectionText,
      });
      return true;
    }

    if (message?.type === 'HIGHLIGHT_PAGE_HEADERS') {
      const color = ACCENT_MAP[message.accentColor] || ACCENT_MAP.indigo;
      const headings = document.querySelectorAll<HTMLElement>('h1, h2, h3');
      headings.forEach((el) => {
        el.style.transition = 'box-shadow 0.25s ease, background-color 0.25s ease';
        el.style.boxShadow = `inset 4px 0 0 ${color}`;
        el.style.backgroundColor = `${color}18`;
        el.style.paddingLeft = '8px';
      });
      sendResponse({ ok: true, count: headings.length });
      return true;
    }

    return false;
  });
}
