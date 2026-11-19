/**
 * Smart DOM Paragraph Context Extractor
 * Extracts the surrounding sentence and paragraph window (~400 chars)
 * around a user's selected Range so translation engines can disambiguate
 * polysemous words accurately.
 */

export interface SelectionContext {
  contextSentence?: string;
  contextParagraph?: string;
  isShortSelection: boolean;
}

const BLOCK_TAGS = new Set([
  'P',
  'LI',
  'BLOCKQUOTE',
  'DD',
  'DT',
  'TD',
  'TH',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'FIGCAPTION',
  'CAPTION',
  'PRE',
  'ARTICLE',
  'SECTION',
  'DIV',
  'MAIN',
]);

const MAX_SENTENCE_CHARS = 240;
const MAX_PARAGRAPH_CHARS = 400;
const MAX_BLOCK_SCAN_CHARS = 4000;

const COMMON_ABBREVIATIONS =
  /\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc|e\.g|i\.e|Fig|No|Vol|Inc|Ltd|Co|U\.S|U\.K)\.$/i;

function normalizeSpaces(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Determine whether the selection is a word or short phrase that benefits
 * from contextual disambiguation (rather than a full sentence or paragraph).
 */
export function isShortWordOrPhrase(selectedText: string): boolean {
  const cleaned = normalizeSpaces(selectedText);
  if (!cleaned) return false;
  if (cleaned.length > 80) return false;
  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
  return wordCount <= 8;
}

/**
 * Split text into sentences with basic abbreviation & decimal awareness.
 */
export function splitIntoSentences(text: string): Array<{ text: string; start: number; end: number }> {
  const sentences: Array<{ text: string; start: number; end: number }> = [];
  if (!text) return sentences;

  let start = 0;
  const len = text.length;

  for (let i = 0; i < len; i++) {
    const ch = text[i];

    // Newline-separated lines act as sentence boundaries
    if (ch === '\n' || ch === '\r') {
      const slice = text.slice(start, i);
      if (slice.trim()) {
        sentences.push({ text: slice, start, end: i });
      }
      start = i + 1;
      continue;
    }

    if (ch === '.' || ch === '!' || ch === '?' || ch === '。' || ch === '！' || ch === '？') {
      const next = text[i + 1];
      // Skip decimals like 3.14 or version numbers like v2.0
      if (ch === '.' && i > 0 && /\d/.test(text[i - 1]) && next && /\d/.test(next)) {
        continue;
      }
      // Consume repeated punctuation like "..." or "?!"
      let endIdx = i;
      while (
        endIdx + 1 < len &&
        (text[endIdx + 1] === '.' ||
          text[endIdx + 1] === '!' ||
          text[endIdx + 1] === '?' ||
          text[endIdx + 1] === '"' ||
          text[endIdx + 1] === "'" ||
          text[endIdx + 1] === '”' ||
          text[endIdx + 1] === ')')
      ) {
        endIdx++;
      }

      const nextAfter = text[endIdx + 1];
      const isEndOrSpace = nextAfter === undefined || /\s/.test(nextAfter) || ch === '。' || ch === '！' || ch === '？';
      if (!isEndOrSpace) {
        continue;
      }

      const candidate = text.slice(start, endIdx + 1);
      if (ch === '.' && COMMON_ABBREVIATIONS.test(candidate.trim())) {
        continue;
      }

      if (candidate.trim()) {
        sentences.push({ text: candidate, start, end: endIdx + 1 });
      }
      i = endIdx;
      start = endIdx + 1;
    }
  }

  if (start < len) {
    const tail = text.slice(start);
    if (tail.trim()) {
      sentences.push({ text: tail, start, end: len });
    }
  }

  return sentences;
}

/**
 * Clamp a long string around a target center offset while respecting word boundaries.
 */
function clampWindowAroundOffset(
  text: string,
  targetStart: number,
  targetEnd: number,
  maxChars: number
): string {
  if (text.length <= maxChars) return normalizeSpaces(text);

  const center = Math.floor((targetStart + targetEnd) / 2);
  let sliceStart = Math.max(0, center - Math.floor(maxChars / 2));
  let sliceEnd = Math.min(text.length, sliceStart + maxChars);

  if (sliceEnd - sliceStart < maxChars) {
    sliceStart = Math.max(0, sliceEnd - maxChars);
  }

  // Snap to word boundaries when cutting mid-text
  if (sliceStart > 0) {
    const spaceIdx = text.indexOf(' ', sliceStart);
    if (spaceIdx !== -1 && spaceIdx < targetStart) {
      sliceStart = spaceIdx + 1;
    }
  }
  if (sliceEnd < text.length) {
    const spaceIdx = text.lastIndexOf(' ', sliceEnd);
    if (spaceIdx !== -1 && spaceIdx > targetEnd) {
      sliceEnd = spaceIdx;
    }
  }

  const trimmed = normalizeSpaces(text.slice(sliceStart, sliceEnd));
  const prefix = sliceStart > 0 ? '… ' : '';
  const suffix = sliceEnd < text.length ? ' …' : '';
  return `${prefix}${trimmed}${suffix}`.trim();
}

/**
 * Pure text helper (also unit-testable without DOM) that extracts
 * `contextSentence` and `contextParagraph` (~400 chars) given a block's text
 * and the exact start/end offsets of the selected word/phrase.
 */
export function extractContextFromBlockText(
  blockText: string,
  selectionStart: number,
  selectionEnd: number,
  selectedText: string
): SelectionContext {
  const cleanSelected = normalizeSpaces(selectedText);
  const shortSelection = isShortWordOrPhrase(cleanSelected);

  if (!blockText.trim() || !cleanSelected) {
    return { isShortSelection: shortSelection };
  }

  // If the selected text covers most of the block, no meaningful surrounding context exists
  const normalizedBlock = normalizeSpaces(blockText);
  if (cleanSelected.length >= normalizedBlock.length * 0.75 && normalizedBlock.length <= 160) {
    return { isShortSelection: shortSelection };
  }

  const safeStart = Math.max(0, Math.min(selectionStart, blockText.length));
  const safeEnd = Math.max(safeStart, Math.min(selectionEnd, blockText.length));

  const sentences = splitIntoSentences(blockText);
  if (sentences.length === 0) {
    return { isShortSelection: shortSelection };
  }

  let targetIdx = sentences.findIndex(
    (s) => safeStart >= s.start && safeStart <= s.end
  );
  if (targetIdx === -1) {
    const lowerSel = cleanSelected.toLowerCase();
    targetIdx = sentences.findIndex((s) =>
      s.text.toLowerCase().includes(lowerSel)
    );
  }
  if (targetIdx === -1) {
    targetIdx = 0;
  }

  const targetSentenceObj = sentences[targetIdx];
  const rawSentence = targetSentenceObj.text;
  const relStart = Math.max(0, safeStart - targetSentenceObj.start);
  const relEnd = Math.max(relStart, safeEnd - targetSentenceObj.start);

  const contextSentence = clampWindowAroundOffset(
    rawSentence,
    relStart,
    relEnd,
    MAX_SENTENCE_CHARS
  );

  // Build paragraph window: target sentence + 1 preceding + 1 following (capped at ~400 chars)
  const prevText = targetIdx > 0 ? normalizeSpaces(sentences[targetIdx - 1].text) : '';
  const currText = normalizeSpaces(rawSentence);
  const nextText =
    targetIdx + 1 < sentences.length ? normalizeSpaces(sentences[targetIdx + 1].text) : '';

  let paragraphParts = [currText];
  let totalLen = currText.length;

  if (prevText && totalLen + prevText.length + 1 <= MAX_PARAGRAPH_CHARS) {
    paragraphParts.unshift(prevText);
    totalLen += prevText.length + 1;
  }
  if (nextText && totalLen + nextText.length + 1 <= MAX_PARAGRAPH_CHARS) {
    paragraphParts.push(nextText);
    totalLen += nextText.length + 1;
  }

  let contextParagraph = paragraphParts.join(' ').trim();
  if (contextParagraph.length > MAX_PARAGRAPH_CHARS) {
    contextParagraph = clampWindowAroundOffset(
      rawSentence,
      relStart,
      relEnd,
      MAX_PARAGRAPH_CHARS
    );
  }

  return {
    contextSentence: contextSentence || undefined,
    contextParagraph: contextParagraph || contextSentence || undefined,
    isShortSelection: shortSelection,
  };
}

/**
 * Find the nearest semantic block element containing the selection Range.
 */
function findContextContainer(node: Node): HTMLElement | null {
  let el: HTMLElement | null =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as HTMLElement)
      : node.parentElement;

  let fallbackEl: HTMLElement | null = null;

  while (el && el !== document.body && el !== document.documentElement) {
    const tag = el.tagName;
    if (BLOCK_TAGS.has(tag)) {
      const len = (el.textContent || '').trim().length;
      if (len >= 12 && len <= MAX_BLOCK_SCAN_CHARS) {
        return el;
      }
      if (!fallbackEl && len >= 12) {
        fallbackEl = el;
      }
    }
    el = el.parentElement;
  }

  return fallbackEl || document.body;
}

/**
 * Extract smart paragraph & sentence context directly from a live DOM Range.
 */
export function extractSelectionContext(
  range: Range,
  selectedText: string
): SelectionContext {
  const cleanSelected = normalizeSpaces(selectedText);
  const shortSelection = isShortWordOrPhrase(cleanSelected);
  if (!cleanSelected) {
    return { isShortSelection: false };
  }

  try {
    const container = findContextContainer(range.commonAncestorContainer);
    if (!container) {
      return { isShortSelection: shortSelection };
    }

    const blockText = container.textContent || '';
    if (!blockText.trim()) {
      return { isShortSelection: shortSelection };
    }

    // Compute exact selection offset inside container so duplicate occurrences are disambiguated
    const prefixRange = document.createRange();
    prefixRange.selectNodeContents(container);
    prefixRange.setEnd(range.startContainer, range.startOffset);
    const selectionStart = prefixRange.toString().length;
    const selectionEnd = selectionStart + range.toString().length;

    return extractContextFromBlockText(
      blockText,
      selectionStart,
      selectionEnd,
      cleanSelected
    );
  } catch {
    return { isShortSelection: shortSelection };
  }
}
