import {
  getExtensionApi,
  getSettings,
  getVocabForPage,
  saveVocabItem,
  removeVocabItem,
  updateVocabItemPhonetic,
  ExtensionSettings,
  VocabItem,
  HighlightColor,
  STORAGE_KEY,
} from '../shared/storage';
import { requestTranslation, requestIpa } from '../shared/messaging';

interface HighlightedRangeEntry {
  range: Range;
  item: VocabItem;
}

const SHADOW_HOST_ID = 'project-x-shadow-host';
const HIGHLIGHT_STYLE_ID = 'project-x-highlight-style';
const HIGHLIGHT_NAME = 'project-x-vocab';

const HIGHLIGHT_PALETTES: Record<
  HighlightColor,
  { bg: string; underline: string; badgeBg: string; badgeText: string }
> = {
  yellow: {
    bg: 'rgba(250, 204, 21, 0.42)',
    underline: '#eab308',
    badgeBg: '#fef9c3',
    badgeText: '#854d0e',
  },
  emerald: {
    bg: 'rgba(52, 211, 153, 0.36)',
    underline: '#10b981',
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
  },
  sky: {
    bg: 'rgba(56, 189, 248, 0.36)',
    underline: '#0ea5e9',
    badgeBg: '#e0f2fe',
    badgeText: '#075985',
  },
  rose: {
    bg: 'rgba(251, 113, 133, 0.35)',
    underline: '#f43f5e',
    badgeBg: '#ffe4e6',
    badgeText: '#9f1239',
  },
};

const ACCENT_MAP: Record<string, string> = {
  indigo: '#6366f1',
  emerald: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
};

const IGNORED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'TEXTAREA',
  'INPUT',
  'SELECT',
  'OPTION',
  'CODE',
  'PRE',
  'SVG',
  'CANVAS',
]);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function speakText(text: string, lang = 'en-US') {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis errors
    }
  }
}

/**
 * Injects or updates the global ::highlight(project-x-vocab) CSS rule in document.head
 */
function ensureHighlightStylesheet(color: HighlightColor = 'yellow') {
  const palette = HIGHLIGHT_PALETTES[color] || HIGHLIGHT_PALETTES.yellow;
  let styleEl = document.getElementById(HIGHLIGHT_STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = HIGHLIGHT_STYLE_ID;
    (document.head || document.documentElement).appendChild(styleEl);
  }
  styleEl.textContent = `
    ::highlight(${HIGHLIGHT_NAME}) {
      background-color: ${palette.bg};
      color: inherit;
      text-decoration: underline solid ${palette.underline} 2px;
    }
  `;
}

/**
 * Shadow DOM Claymorphism Stylesheet for On-Page Selection Popup & Hover Meaning Tooltip
 */
const SHADOW_CLAY_CSS = `
  :host {
    all: initial;
    font-family: 'Plus Jakarta Sans', 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .px-clay-root {
    --clay-surface: #ffffff;
    --clay-recessed: #eeebf8;
    --clay-text-primary: #1e1b4b;
    --clay-text-secondary: #4c4975;
    --clay-text-muted: #7c78a3;
    --clay-shadow-card:
      0 16px 32px -8px rgba(67, 56, 202, 0.24),
      inset 0 4px 8px 0 rgba(255, 255, 255, 0.96),
      inset 0 -6px 12px 0 rgba(165, 158, 214, 0.34);
    --clay-shadow-sm:
      0 6px 14px -3px rgba(99, 102, 241, 0.18),
      inset 0 3px 5px 0 rgba(255, 255, 255, 0.92),
      inset 0 -4px 7px 0 rgba(165, 158, 214, 0.28);
    --clay-accent-gradient: linear-gradient(145deg, #818cf8 0%, #6366f1 100%);
    --clay-accent-shadow:
      0 8px 18px -4px rgba(99, 102, 241, 0.45),
      inset 0 3px 6px 0 rgba(255, 255, 255, 0.48),
      inset 0 -4px 8px 0 rgba(49, 46, 129, 0.38);
    color: var(--clay-text-primary);
    font-family: 'Plus Jakarta Sans', 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .px-clay-root[data-theme='dark'] {
    --clay-surface: #1e1b2e;
    --clay-recessed: #151221;
    --clay-text-primary: #f5f3ff;
    --clay-text-secondary: #c4b5fd;
    --clay-text-muted: #8b83b0;
    --clay-shadow-card:
      0 18px 34px -6px rgba(0, 0, 0, 0.68),
      inset 0 3px 6px 0 rgba(255, 255, 255, 0.12),
      inset 0 -6px 12px 0 rgba(8, 6, 16, 0.72);
    --clay-shadow-sm:
      0 8px 16px -4px rgba(0, 0, 0, 0.55),
      inset 0 2px 4px 0 rgba(255, 255, 255, 0.11),
      inset 0 -4px 8px 0 rgba(8, 6, 16, 0.65);
  }

  @keyframes pxClayPopIn {
    0% {
      opacity: 0;
      transform: scale(0.9) translateY(6px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .px-clay-popover,
  .px-clay-tooltip {
    position: fixed;
    z-index: 2147483646;
    background: var(--clay-surface);
    color: var(--clay-text-primary);
    border-radius: 22px;
    padding: 14px 16px;
    box-shadow: var(--clay-shadow-card);
    border: 1px solid rgba(255, 255, 255, 0.55);
    min-width: 240px;
    max-width: 340px;
    animation: pxClayPopIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    box-sizing: border-box;
    line-height: 1.45;
  }

  .px-clay-root[data-theme='dark'] .px-clay-popover,
  .px-clay-root[data-theme='dark'] .px-clay-tooltip {
    border-color: rgba(255, 255, 255, 0.08);
  }

  .px-clay-icon-launcher {
    position: fixed;
    z-index: 2147483646;
    width: 38px;
    height: 38px;
    border-radius: 14px;
    background: var(--clay-accent-gradient);
    color: #ffffff;
    box-shadow: var(--clay-accent-shadow);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 15px;
    animation: pxClayPopIn 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    transition: transform 0.15s ease;
  }

  .px-clay-icon-launcher:hover {
    transform: translateY(-2px) scale(1.04);
  }

  .px-clay-icon-launcher:active {
    transform: translateY(2px) scale(0.97);
  }

  .px-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
  }

  .px-source-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    min-width: 0;
  }

  .px-source-word {
    font-size: 14px;
    font-weight: 800;
    color: var(--clay-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 215px;
  }

  .px-phonetic {
    font-family: 'Lucida Sans Unicode', 'DejaVu Sans', 'Segoe UI', Arial, sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: var(--clay-text-muted);
    letter-spacing: 0.01em;
    overflow-wrap: anywhere;
    max-width: 225px;
  }

  .px-meaning-box {
    background: var(--clay-recessed);
    border-radius: 14px;
    padding: 10px 12px;
    font-size: 14px;
    font-weight: 700;
    color: var(--clay-text-primary);
    box-shadow:
      inset 0 3px 6px rgba(109, 102, 168, 0.18),
      inset 0 -2px 4px rgba(255, 255, 255, 0.7);
    margin-bottom: 10px;
    word-break: break-word;
  }

  .px-clay-root[data-theme='dark'] .px-meaning-box {
    box-shadow:
      inset 0 3px 6px rgba(0, 0, 0, 0.55),
      inset 0 -1px 3px rgba(255, 255, 255, 0.05);
  }

  .px-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .px-pill-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    background: rgba(99, 102, 241, 0.14);
    color: #6366f1;
  }

  .px-clay-root[data-theme='dark'] .px-pill-badge {
    background: rgba(129, 140, 248, 0.18);
    color: #a5b4fc;
  }

  .px-icon-btn {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    border: none;
    background: var(--clay-surface);
    color: var(--clay-text-secondary);
    box-shadow: var(--clay-shadow-sm);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    transition: transform 0.14s ease, box-shadow 0.14s ease;
    flex-shrink: 0;
  }

  .px-icon-btn:hover {
    transform: translateY(-2px);
    color: var(--clay-text-primary);
  }

  .px-icon-btn:active {
    transform: translateY(2px);
  }

  .px-icon-btn-danger:hover {
    color: #f43f5e;
  }

  .px-action-btn {
    border: none;
    border-radius: 12px;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 800;
    background: var(--clay-accent-gradient);
    color: #ffffff;
    box-shadow: var(--clay-accent-shadow);
    cursor: pointer;
    transition: transform 0.14s ease;
  }

  .px-action-btn:hover {
    transform: translateY(-2px);
  }

  .px-action-btn:active {
    transform: translateY(2px);
  }
`;

export class ContentHighlighterController {
  private settings: ExtensionSettings | null = null;
  private activeRanges: HighlightedRangeEntry[] = [];
  private shadowRoot: ShadowRoot | null = null;
  private rootContainer: HTMLDivElement | null = null;
  private selectionPopoverEl: HTMLDivElement | null = null;
  private hoverTooltipEl: HTMLDivElement | null = null;
  private hoveredWordId: string | null = null;
  private hoverHideTimer: number | null = null;
  private isPointerInsideTooltip = false;
  private rafPending = false;
  private scanScope: HTMLElement;

  constructor(scanScope?: HTMLElement) {
    this.scanScope = scanScope || document.body;
  }

  public async init() {
    this.mountShadowHost();
    this.settings = await getSettings();
    this.syncThemeOnShadow();
    this.applyPageHighlights();
    this.attachEventListeners();
    this.attachStorageSync();
  }

  public setScanScope(el: HTMLElement) {
    this.scanScope = el;
    this.applyPageHighlights();
  }

  private mountShadowHost() {
    let host = document.getElementById(SHADOW_HOST_ID) as HTMLDivElement | null;
    if (!host) {
      host = document.createElement('div');
      host.id = SHADOW_HOST_ID;
      document.documentElement.appendChild(host);
    }

    this.shadowRoot = host.shadowRoot || host.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = '';

    const styleEl = document.createElement('style');
    styleEl.textContent = SHADOW_CLAY_CSS;
    this.shadowRoot.appendChild(styleEl);

    this.rootContainer = document.createElement('div');
    this.rootContainer.className = 'px-clay-root';
    this.shadowRoot.appendChild(this.rootContainer);
  }

  private syncThemeOnShadow() {
    if (!this.rootContainer || !this.settings) return;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark =
      this.settings.theme === 'dark' ||
      (this.settings.theme === 'system' && prefersDark);
    this.rootContainer.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  /**
   * Scans the DOM via TreeWalker and registers all occurrences of saved vocabulary
   * for the current URL into CSS.highlights.set('project-x-vocab', Highlight)
   */
  public applyPageHighlights() {
    if (!this.settings) return;
    ensureHighlightStylesheet(this.settings.highlightColor);

    const vocabList = getVocabForPage(this.settings, window.location.href);
    this.activeRanges = [];

    const cssHighlights = (
      CSS as unknown as {
        highlights?: Map<string, unknown>;
      }
    ).highlights;

    const HighlightCtor = (
      globalThis as unknown as {
        Highlight?: new (...ranges: Range[]) => unknown;
      }
    ).Highlight;

    if (vocabList.length === 0) {
      cssHighlights?.delete(HIGHLIGHT_NAME);
      return;
    }

    const rootNode = this.scanScope || document.body;
    if (!rootNode) return;

    // Sort longer phrases first so multi-word phrases match cleanly
    const sortedVocab = [...vocabList].sort(
      (a, b) => b.sourceText.length - a.sourceText.length
    );

    const patterns = sortedVocab
      .filter((v) => v.sourceText.trim().length > 0)
      .map((item) => {
        const escaped = escapeRegExp(item.sourceText.trim());
        const isWordCharsOnly = /^[a-zA-Z0-9\s'-]+$/.test(item.sourceText.trim());
        const regex = isWordCharsOnly
          ? new RegExp(`\\b${escaped}\\b`, 'gi')
          : new RegExp(escaped, 'gi');
        return { item, regex };
      });

    const walker = document.createTreeWalker(
      rootNode,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (IGNORED_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
          if (parent.closest(`#${SHADOW_HOST_ID}`)) return NodeFilter.FILTER_REJECT;
          if (!node.nodeValue || !node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const rawRanges: Range[] = [];
    let currentNode = walker.nextNode() as Text | null;

    while (currentNode) {
      const textVal = currentNode.nodeValue || '';
      for (const { item, regex } of patterns) {
        regex.lastIndex = 0;
        let match = regex.exec(textVal);
        while (match !== null) {
          const start = match.index;
          const end = start + match[0].length;
          try {
            const range = document.createRange();
            range.setStart(currentNode, start);
            range.setEnd(currentNode, end);
            rawRanges.push(range);
            this.activeRanges.push({ range, item });
          } catch {
            // Ignore invalid boundary offsets
          }
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
          match = regex.exec(textVal);
        }
      }
      currentNode = walker.nextNode() as Text | null;
    }

    if (cssHighlights && HighlightCtor) {
      const highlightInstance = new HighlightCtor(...rawRanges);
      cssHighlights.set(HIGHLIGHT_NAME, highlightInstance);
    }
  }

  private clampViewportPosition(x: number, y: number, width = 290, height = 140) {
    const pad = 12;
    const clampedX = Math.max(
      pad,
      Math.min(x, window.innerWidth - width - pad)
    );
    const clampedY =
      y + height + pad > window.innerHeight
        ? Math.max(pad, y - height - 16)
        : Math.max(pad, y);
    return { left: clampedX, top: clampedY };
  }

  private clearSelectionPopover() {
    if (this.selectionPopoverEl) {
      this.selectionPopoverEl.remove();
      this.selectionPopoverEl = null;
    }
  }

  private clearHoverTooltip() {
    if (this.hoverTooltipEl) {
      this.hoverTooltipEl.remove();
      this.hoverTooltipEl = null;
    }
    this.hoveredWordId = null;
  }

  /**
   * Renders the Claymorphism Selection Translation Popup
   */
  private async showTranslationPopup(
    selectedText: string,
    anchorRect: DOMRect,
    forceTranslateAndSave = false
  ) {
    if (!this.rootContainer || !this.settings) return;
    this.clearSelectionPopover();
    this.clearHoverTooltip();

    const mode = this.settings.selectionMode || 'auto';

    // If selectionMode is 'icon' and user hasn't clicked the launcher icon yet, render floating Clay icon
    if (mode === 'icon' && !forceTranslateAndSave) {
      const launcher = document.createElement('button');
      launcher.type = 'button';
      launcher.className = 'px-clay-icon-launcher';
      launcher.title = 'Translate & Highlight with Project X';
      const pos = this.clampViewportPosition(
        anchorRect.right + 6,
        anchorRect.bottom + 6,
        44,
        44
      );
      launcher.style.left = `${pos.left}px`;
      launcher.style.top = `${pos.top}px`;
      launcher.textContent = '✨';
      launcher.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showTranslationPopup(selectedText, anchorRect, true);
      });
      this.rootContainer.appendChild(launcher);
      this.selectionPopoverEl = launcher as unknown as HTMLDivElement;
      return;
    }

    const popover = document.createElement('div');
    popover.className = 'px-clay-popover';
    const pos = this.clampViewportPosition(
      anchorRect.left,
      anchorRect.bottom + 10,
      300,
      155
    );
    popover.style.left = `${pos.left}px`;
    popover.style.top = `${pos.top}px`;

    popover.innerHTML = `
      <div class="px-header">
        <div class="px-source-wrap">
          <span class="px-source-word">${escapeHtml(selectedText)}</span>
        </div>
        <span class="px-pill-badge">Translating...</span>
      </div>
      <div class="px-meaning-box" style="opacity: 0.75;">
        ✨ Translating selection...
      </div>
    `;

    // Prevent clicks inside popover from immediately closing it
    popover.addEventListener('mousedown', (e) => e.stopPropagation());
    popover.addEventListener('mouseup', (e) => e.stopPropagation());

    this.rootContainer.appendChild(popover);
    this.selectionPopoverEl = popover;

    const shouldAutoSave =
      forceTranslateAndSave ||
      (mode === 'auto' && this.settings.autoTranslateOnSelect);

    const response = await requestTranslation({
      text: selectedText,
      pageUrl: window.location.href,
      pageTitle: document.title,
      autoSave: shouldAutoSave,
    });

    if (this.selectionPopoverEl !== popover) return;

    if (!response.ok || !response.result) {
      popover.innerHTML = `
        <div class="px-header">
          <span class="px-source-word">${escapeHtml(selectedText)}</span>
          <button type="button" class="px-icon-btn" data-action="close" title="Close">✕</button>
        </div>
        <div class="px-meaning-box">
          Unable to translate right now. Please try again.
        </div>
      `;
      popover
        .querySelector('[data-action="close"]')
        ?.addEventListener('click', () => this.clearSelectionPopover());
      return;
    }

    const { result } = response;
    if (shouldAutoSave) {
      this.settings = await getSettings();
      this.applyPageHighlights();
    }

    const renderSavedState = (isSaved: boolean) => {
      popover.innerHTML = `
        <div class="px-header">
          <div class="px-source-wrap">
            <span class="px-source-word" title="${escapeHtml(result.sourceText)}">
              ${escapeHtml(result.sourceText)}
            </span>
            ${
              result.phonetic
                ? `<span class="px-phonetic">${escapeHtml(result.phonetic)}</span>`
                : ''
            }
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button type="button" class="px-icon-btn" data-action="speak" title="Listen pronunciation">
              🔊
            </button>
            <button type="button" class="px-icon-btn" data-action="close" title="Close">
              ✕
            </button>
          </div>
        </div>
        <div class="px-meaning-box">
          ${escapeHtml(result.translatedText)}
        </div>
        <div class="px-footer">
          <span class="px-pill-badge">
            ${
              isSaved
                ? '✨ Highlighted & Saved'
                : `🌐 ${escapeHtml(result.targetLang.toUpperCase())}`
            }
          </span>
          ${
            isSaved
              ? `<button type="button" class="px-icon-btn px-icon-btn-danger" data-action="remove" title="Remove highlight">🗑</button>`
              : `<button type="button" class="px-action-btn" data-action="save">✨ Save & Highlight</button>`
          }
        </div>
      `;

      popover
        .querySelector('[data-action="speak"]')
        ?.addEventListener('click', () => speakText(result.sourceText));

      popover
        .querySelector('[data-action="close"]')
        ?.addEventListener('click', () => this.clearSelectionPopover());

      popover
        .querySelector('[data-action="save"]')
        ?.addEventListener('click', async () => {
          const saved = await saveVocabItem({
            sourceText: result.sourceText,
            translatedText: result.translatedText,
            phonetic: result.phonetic,
            targetLang: result.targetLang,
            pageUrl: window.location.href,
            pageTitle: document.title,
          });
          this.settings = saved.settings;
          this.applyPageHighlights();
          renderSavedState(true);
        });

      popover
        .querySelector('[data-action="remove"]')
        ?.addEventListener('click', async () => {
          this.settings = await removeVocabItem(
            window.location.href,
            result.sourceText
          );
          this.applyPageHighlights();
          this.clearSelectionPopover();
        });
    };

    renderSavedState(shouldAutoSave);
  }

  /**
   * Renders the Claymorphism Hover Meaning Tooltip when hovering a ::highlight(project-x-vocab) word
   */
  private showHoverTooltip(item: VocabItem, rect: DOMRect) {
    if (!this.rootContainer) return;
    if (this.hoveredWordId === item.id && this.hoverTooltipEl) return;

    this.clearHoverTooltip();
    this.hoveredWordId = item.id;

    const tooltip = document.createElement('div');
    tooltip.className = 'px-clay-tooltip';
    const pos = this.clampViewportPosition(
      rect.left,
      rect.bottom + 8,
      270,
      125
    );
    tooltip.style.left = `${pos.left}px`;
    tooltip.style.top = `${pos.top}px`;

    tooltip.innerHTML = `
      <div class="px-header">
        <div class="px-source-wrap">
          <span class="px-source-word" title="${escapeHtml(item.sourceText)}">${escapeHtml(item.sourceText)}</span>
          <span class="px-phonetic" data-role="ipa" ${item.phonetic ? '' : 'style="display:none;"'}>${
            item.phonetic ? escapeHtml(item.phonetic) : ''
          }</span>
        </div>
        <div style="display: flex; align-items: center; gap: 5px;">
          <button type="button" class="px-icon-btn" data-action="speak" title="Pronounce">
            🔊
          </button>
          <button type="button" class="px-icon-btn px-icon-btn-danger" data-action="remove" title="Remove highlight">
            🗑
          </button>
        </div>
      </div>
      <div class="px-meaning-box" style="margin-bottom: 0;">
        ${escapeHtml(item.translatedText)}
      </div>
    `;

    if (!item.phonetic) {
      requestIpa(item.sourceText).then((ipa) => {
        if (!ipa) return;
        item.phonetic = ipa;
        if (this.hoverTooltipEl === tooltip) {
          const ipaEl = tooltip.querySelector<HTMLElement>('[data-role="ipa"]');
          if (ipaEl) {
            ipaEl.textContent = ipa;
            ipaEl.style.display = '';
          }
        }
        updateVocabItemPhonetic(item.pageUrl, item.sourceText, ipa).catch(() => {});
      });
    }

    tooltip.addEventListener('mouseenter', () => {
      this.isPointerInsideTooltip = true;
      if (this.hoverHideTimer) {
        window.clearTimeout(this.hoverHideTimer);
        this.hoverHideTimer = null;
      }
    });

    tooltip.addEventListener('mouseleave', () => {
      this.isPointerInsideTooltip = false;
      this.scheduleHideHoverTooltip();
    });

    tooltip
      .querySelector('[data-action="speak"]')
      ?.addEventListener('click', (e) => {
        e.stopPropagation();
        speakText(item.sourceText);
      });

    tooltip
      .querySelector('[data-action="remove"]')
      ?.addEventListener('click', async (e) => {
        e.stopPropagation();
        this.settings = await removeVocabItem(
          window.location.href,
          item.sourceText
        );
        this.applyPageHighlights();
        this.clearHoverTooltip();
      });

    this.rootContainer.appendChild(tooltip);
    this.hoverTooltipEl = tooltip;
  }

  private scheduleHideHoverTooltip() {
    if (this.hoverHideTimer) {
      window.clearTimeout(this.hoverHideTimer);
    }
    this.hoverHideTimer = window.setTimeout(() => {
      if (!this.isPointerInsideTooltip) {
        this.clearHoverTooltip();
      }
    }, 220);
  }

  /**
   * Scrolls smoothly to the first occurrence of a highlighted word on the page
   */
  public scrollToWord(sourceText: string): boolean {
    const targetLower = sourceText.trim().toLowerCase();
    const match = this.activeRanges.find(
      (entry) => entry.item.sourceText.trim().toLowerCase() === targetLower
    );
    if (!match) return false;

    const rects = match.range.getClientRects();
    const firstRect = rects[0] || match.range.getBoundingClientRect();
    const parentEl = match.range.startContainer.parentElement;

    if (parentEl) {
      parentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (firstRect) {
      window.setTimeout(() => {
        const updatedRect = match.range.getBoundingClientRect();
        this.showHoverTooltip(match.item, updatedRect);
      }, 320);
    }
    return true;
  }

  private attachEventListeners() {
    // 1. Selection listener (mouseup)
    document.addEventListener('mouseup', (e) => {
      const target = e.target as Node | null;
      if (target && target instanceof Element) {
        if (target.closest(`#${SHADOW_HOST_ID}`)) return;
        if (
          target.closest('input, textarea, select, [contenteditable="true"]')
        ) {
          return;
        }
        // In Dev Workbench, only trigger selection popup inside [data-px-article] if present
        const workbenchArticle = document.querySelector('[data-px-article]');
        if (workbenchArticle && !workbenchArticle.contains(target)) {
          return;
        }
      }

      window.setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim() || '';
        if (!text || text.length < 2 || text.length > 240) {
          return;
        }
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        this.showTranslationPopup(text, rect);
      }, 15);
    });

    // Close selection popover when clicking elsewhere
    document.addEventListener('mousedown', (e) => {
      const target = e.target as Element | null;
      if (target?.closest(`#${SHADOW_HOST_ID}`)) return;
      this.clearSelectionPopover();
    });

    // 2. Throttled mousemove listener for CSS.highlights Range hover hit-testing
    document.addEventListener(
      'mousemove',
      (e) => {
        if (this.rafPending || this.activeRanges.length === 0) return;
        if (this.selectionPopoverEl) return;

        const { clientX, clientY } = e;
        this.rafPending = true;

        window.requestAnimationFrame(() => {
          this.rafPending = false;
          if (this.isPointerInsideTooltip) return;

          for (const entry of this.activeRanges) {
            const rects = entry.range.getClientRects();
            for (let i = 0; i < rects.length; i++) {
              const r = rects[i];
              if (
                clientX >= r.left - 2 &&
                clientX <= r.right + 2 &&
                clientY >= r.top - 2 &&
                clientY <= r.bottom + 2
              ) {
                if (this.hoverHideTimer) {
                  window.clearTimeout(this.hoverHideTimer);
                  this.hoverHideTimer = null;
                }
                this.showHoverTooltip(entry.item, r);
                return;
              }
            }
          }

          if (this.hoverTooltipEl && !this.isPointerInsideTooltip) {
            this.scheduleHideHoverTooltip();
          }
        });
      },
      { passive: true }
    );

    // 3. Listen for Dev Workbench custom scroll event
    window.addEventListener('project_x_scroll_to_vocab', (e: Event) => {
      const custom = e as CustomEvent<{ sourceText?: string }>;
      if (custom.detail?.sourceText) {
        this.scrollToWord(custom.detail.sourceText);
      }
    });
  }

  private attachStorageSync() {
    const api = getExtensionApi();
    if (api?.storage?.onChanged) {
      api.storage.onChanged.addListener(async (changes, areaName) => {
        if (areaName === 'local' && changes[STORAGE_KEY]) {
          this.settings = await getSettings();
          this.syncThemeOnShadow();
          this.applyPageHighlights();
        }
      });
    } else {
      window.addEventListener('project_x_storage_sync', async () => {
        this.settings = await getSettings();
        this.syncThemeOnShadow();
        this.applyPageHighlights();
      });

      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('project_x_storage_sync');
        bc.onmessage = async () => {
          this.settings = await getSettings();
          this.syncThemeOnShadow();
          this.applyPageHighlights();
        };
      }
    }

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
            highlightedCount: this.activeRanges.length,
          });
          return false;
        }

        if (message?.type === 'HIGHLIGHT_PAGE_HEADERS') {
          const color = ACCENT_MAP[message.accentColor] || ACCENT_MAP.indigo;
          const headings = document.querySelectorAll<HTMLElement>('h1, h2, h3');
          headings.forEach((el) => {
            el.style.transition =
              'box-shadow 0.25s ease, background-color 0.25s ease';
            el.style.boxShadow = `inset 4px 0 0 ${color}`;
            el.style.backgroundColor = `${color}18`;
            el.style.paddingLeft = '8px';
          });
          sendResponse({ ok: true, count: headings.length });
          return false;
        }

        if (message?.type === 'SCROLL_TO_VOCAB' && message.sourceText) {
          const scrolled = this.scrollToWord(String(message.sourceText));
          sendResponse({ ok: scrolled });
          return false;
        }

        if (message?.type === 'REFRESH_HIGHLIGHTS') {
          getSettings()
            .then((s) => {
              this.settings = s;
              this.syncThemeOnShadow();
              this.applyPageHighlights();
              sendResponse({ ok: true });
            })
            .catch(() => {
              sendResponse({ ok: false });
            });
          return true;
        }

        return false;
      });
    }
  }
}

let singletonController: ContentHighlighterController | null = null;

export function initContentHighlighter(
  customScope?: HTMLElement
): ContentHighlighterController {
  if (!singletonController) {
    singletonController = new ContentHighlighterController(customScope);
    singletonController.init();
  } else if (customScope) {
    singletonController.setScanScope(customScope);
  }
  return singletonController;
}

// Auto-initialize when injected as a browser extension Content Script on any webpage
if (
  typeof window !== 'undefined' &&
  !window.location.pathname.endsWith('sidepanel.html') &&
  !window.location.pathname.endsWith('options.html') &&
  !window.location.pathname.endsWith('popup.html')
) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initContentHighlighter());
  } else {
    initContentHighlighter();
  }
}
