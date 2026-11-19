import type { ExtensionSettings, TranslationProvider } from '../shared/storage';

export interface TranslationContext {
  sentence?: string;
  paragraph?: string;
  pageTitle?: string;
}

export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  targetLang: string;
  detectedSourceLang?: string;
  phonetic?: string;
  partOfSpeech?: string;
  alternativeMeanings?: string[];
  contextUsed?: boolean;
  provider: TranslationProvider | 'dictionary-fallback';
}

interface ProviderTranslationOutput {
  translatedText: string;
  detectedSourceLang?: string;
  partOfSpeech?: string;
  alternativeMeanings?: string[];
  contextUsed?: boolean;
}

/**
 * Built-in offline glossary for instant fallback when offline or in restricted network environments
 */
const OFFLINE_GLOSSARY_VI: Record<string, string> = {
  'manifest v3': 'Tệp kê khai phiên bản 3 (Chuẩn tiện ích mở rộng hiện đại)',
  'claymorphism': 'Phong cách thiết kế đất sét 3D mềm mại',
  'service worker': 'Trình xử lý chạy nền sự kiện (Service Worker)',
  'content script': 'Kịch bản nội dung chạy trực tiếp trên trang web',
  'side panel': 'Bảng điều khiển cạnh bên trình duyệt',
  'custom highlight api': 'API tô sáng văn bản bằng CSS không làm thay đổi DOM',
  'shadow dom': 'Cây DOM cô lập giúp bảo vệ giao diện khỏi xung đột CSS',
  'vocabulary': 'Từ vựng',
  'extension': 'Tiện ích mở rộng trình duyệt',
  'browser': 'Trình duyệt web',
  'storage': 'Bộ nhớ lưu trữ cục bộ',
  'highlight': 'Tô sáng / Đánh dấu nổi bật',
  'translate': 'Dịch thuật ngôn ngữ',
};

const OFFLINE_GLOSSARY_IPA: Record<string, string> = {
  'manifest v3': '/ˈmænɪfɛst viː θriː/',
  'claymorphism': '/ˈkleɪmɔːrfɪzəm/',
  'service worker': '/ˈsɜːrvɪs ˈwɜːrkər/',
  'content script': '/ˈkɑːntɛnt skrɪpt/',
  'side panel': '/saɪd ˈpænəl/',
  'custom highlight api': '/ˈkʌstəm ˈhaɪlaɪt eɪ piː aɪ/',
  'shadow dom': '/ˈʃædoʊ dɑːm/',
  'vocabulary': '/voʊˈkæbjəlɛri/',
  'extension': '/ɪkˈstɛnʃən/',
  'browser': '/ˈbraʊzər/',
  'storage': '/ˈstɔːrɪdʒ/',
  'highlight': '/ˈhaɪlaɪt/',
  'translate': '/trænsˈleɪt/',
};

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function dedupeAlternatives(
  primary: string,
  candidates: string[],
  max = 5
): string[] {
  const seen = new Set<string>([primary.trim().toLowerCase()]);
  const result: string[] = [];

  for (const raw of candidates) {
    const clean = raw.trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
    if (result.length >= max) break;
  }

  return result;
}

export function shouldUseWordContext(
  sourceText: string,
  context?: TranslationContext
): boolean {
  if (!context) return false;
  const ctxText = (context.paragraph || context.sentence || '').trim();
  if (!ctxText) return false;
  if (sourceText.length > 80) return false;
  const wordCount = sourceText.split(/\s+/).filter(Boolean).length;
  if (wordCount > 8) return false;
  return ctxText.length > sourceText.length + 6;
}

interface GoogleDictGroup {
  partOfSpeech: string;
  terms: string[];
}

export interface ParsedGoogleResponse {
  translatedText: string;
  detectedSourceLang?: string;
  dictGroups: GoogleDictGroup[];
  alternatives: string[];
}

export function parseGoogleDictionaryResponse(data: unknown): ParsedGoogleResponse {
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error('Empty response from Google Translate');
  }

  const translatedText = data[0]
    .map((segment: unknown) => (Array.isArray(segment) ? String(segment[0] ?? '') : ''))
    .join('')
    .trim();

  if (!translatedText) {
    throw new Error('Empty response from Google Translate');
  }

  const detectedSourceLang = typeof data[2] === 'string' ? data[2] : undefined;
  const dictGroups: GoogleDictGroup[] = [];
  const rawAlts: string[] = [];

  // data[1]: Dictionary entries grouped by part of speech
  if (Array.isArray(data[1])) {
    for (const group of data[1]) {
      if (!Array.isArray(group)) continue;
      const pos = typeof group[0] === 'string' ? group[0].trim() : '';
      const terms: string[] = [];
      if (Array.isArray(group[1])) {
        for (const term of group[1]) {
          if (typeof term === 'string' && term.trim()) {
            terms.push(term.trim());
            rawAlts.push(term.trim());
          }
        }
      }
      if (pos || terms.length > 0) {
        dictGroups.push({ partOfSpeech: pos, terms });
      }
    }
  }

  // data[5]: Alternative translations
  if (Array.isArray(data[5])) {
    for (const entry of data[5]) {
      if (!Array.isArray(entry) || !Array.isArray(entry[2])) continue;
      for (const alt of entry[2]) {
        if (Array.isArray(alt) && typeof alt[0] === 'string' && alt[0].trim()) {
          rawAlts.push(alt[0].trim());
        }
      }
    }
  }

  return {
    translatedText,
    detectedSourceLang,
    dictGroups,
    alternatives: dedupeAlternatives(translatedText, rawAlts, 6),
  };
}

/**
 * Wrap the target word/phrase inside a sentence with guillemets «...»
 * so Google Translate NMT translates it in context and preserves its span.
 */
export function buildMarkedContextSentence(
  sentence: string,
  sourceText: string
): string | null {
  const cleanSentence = sentence.trim();
  const cleanTarget = sourceText.trim();
  if (!cleanSentence || !cleanTarget) return null;

  const escaped = escapeRegExp(cleanTarget);
  const isWordOnly = /^[a-zA-Z0-9\s'-]+$/.test(cleanTarget);
  const regex = isWordOnly
    ? new RegExp(`\\b${escaped}\\b`, 'i')
    : new RegExp(escaped, 'i');

  if (!regex.test(cleanSentence)) {
    return null;
  }

  return cleanSentence.replace(regex, (match) => `«${match}»`);
}

/**
 * Extract and validate the translated span inside «...» from a translated sentence.
 */
export function extractBracketedTranslation(
  translatedSentence: string,
  baseTranslation: string
): string | null {
  const match =
    translatedSentence.match(/«([^«»]+)»/) ||
    translatedSentence.match(/<<([^<>]+)>>/);

  if (!match || !match[1]) return null;

  const extracted = match[1]
    .replace(/^[\s"'“”‘’.,;:!?()[\]-]+|[\s"'“”‘’.,;:!?()[\]-]+$/g, '')
    .trim();

  if (!extracted) return null;
  if (/[«»<>]/.test(extracted)) return null;

  const maxAllowedLen = Math.max(baseTranslation.length * 3.5, 64);
  if (extracted.length > maxAllowedLen) return null;

  // Reject if the whole sentence accidentally ended up inside the brackets
  const cleanFull = translatedSentence.replace(/[«»<>]/g, '').trim();
  if (cleanFull.length > 40 && extracted.length >= cleanFull.length * 0.85) {
    return null;
  }

  return extracted;
}

function findPosForTerm(
  term: string,
  dictGroups: GoogleDictGroup[]
): string | undefined {
  const lower = term.trim().toLowerCase();
  for (const group of dictGroups) {
    if (group.terms.some((t) => t.toLowerCase() === lower)) {
      return group.partOfSpeech || undefined;
    }
  }
  return undefined;
}

/**
 * 1. Free Google Translate Web Endpoint (Zero-Config Default)
 * Enhanced with dt=bd (dictionary senses & POS) + parallel bracketed-sentence
 * contextual disambiguation when reading in context.
 */
async function translateWithGoogleFree(
  text: string,
  targetLang: string,
  context?: TranslationContext
): Promise<ProviderTranslationOutput> {
  const baseUrl =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto` +
    `&tl=${encodeURIComponent(targetLang)}&dt=t&dt=bd&dt=at&q=${encodeURIComponent(text)}`;

  const useContext = shouldUseWordContext(text, context);
  const markedSentence =
    useContext && context?.sentence
      ? buildMarkedContextSentence(context.sentence, text)
      : null;

  const basePromise = fetch(baseUrl, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  }).then(async (res) => {
    if (!res.ok) throw new Error(`Google Translate HTTP ${res.status}`);
    return parseGoogleDictionaryResponse(await res.json());
  });

  const contextPromise = markedSentence
    ? fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto` +
          `&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(markedSentence)}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }
      )
        .then(async (res) => {
          if (!res.ok) return null;
          const data = await res.json();
          if (Array.isArray(data) && Array.isArray(data[0])) {
            return data[0]
              .map((seg: unknown) => (Array.isArray(seg) ? String(seg[0] ?? '') : ''))
              .join('')
              .trim();
          }
          return null;
        })
        .catch(() => null)
    : Promise.resolve(null);

  const [baseRes, translatedContextSentence] = await Promise.all([
    basePromise,
    contextPromise,
  ]);

  let finalMeaning = baseRes.translatedText;
  let contextUsed = false;
  let matchedPos: string | undefined = baseRes.dictGroups[0]?.partOfSpeech || undefined;

  if (translatedContextSentence) {
    const extracted = extractBracketedTranslation(
      translatedContextSentence,
      baseRes.translatedText
    );

    if (extracted) {
      finalMeaning = extracted;
      contextUsed = true;
      matchedPos = findPosForTerm(extracted, baseRes.dictGroups) || matchedPos;
    } else {
      // Heuristic fallback: check if any dictionary candidate appears in the translated sentence
      const lowerSentence = translatedContextSentence.toLowerCase();
      const sortedCandidates = [...baseRes.alternatives].sort(
        (a, b) => b.length - a.length
      );
      const matchedCandidate = sortedCandidates.find(
        (cand) => cand.length >= 2 && lowerSentence.includes(cand.toLowerCase())
      );
      if (matchedCandidate) {
        finalMeaning = matchedCandidate;
        contextUsed = true;
        matchedPos = findPosForTerm(matchedCandidate, baseRes.dictGroups) || matchedPos;
      }
    }
  }

  const allCandidates = [baseRes.translatedText, ...baseRes.alternatives];
  const alternativeMeanings = dedupeAlternatives(finalMeaning, allCandidates, 5);

  return {
    translatedText: finalMeaning,
    detectedSourceLang: baseRes.detectedSourceLang,
    partOfSpeech: matchedPos,
    alternativeMeanings: alternativeMeanings.length > 0 ? alternativeMeanings : undefined,
    contextUsed,
  };
}

interface DictionaryWordMeta {
  phonetic?: string;
  partOfSpeech?: string;
  definition?: string;
}

const wordMetaCache = new Map<string, DictionaryWordMeta>();

function stripIpaDelimiters(ipa: string): string {
  return ipa.trim().replace(/^[/[]+/, '').replace(/[/\]]+$/, '').trim();
}

/**
 * Free Dictionary API lookup for a single English word (with timeout + in-memory cache)
 */
async function fetchSingleWordMeta(word: string): Promise<DictionaryWordMeta> {
  const cleaned = word
    .trim()
    .replace(/^[^a-zA-Z0-9'-]+|[^a-zA-Z0-9'-]+$/g, '')
    .toLowerCase();
  if (!cleaned || cleaned.length > 35 || !/[a-z]/.test(cleaned)) {
    return {};
  }

  const cached = wordMetaCache.get(cleaned);
  if (cached) return cached;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2800);

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleaned)}`,
      { signal: controller.signal }
    );
    if (!res.ok) {
      wordMetaCache.set(cleaned, {});
      return {};
    }
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      const entry = data[0];
      const rawPhonetic: string | undefined =
        entry.phonetic?.trim() ||
        entry.phonetics
          ?.find((p: { text?: string }) => typeof p.text === 'string' && p.text.trim())
          ?.text?.trim();
      const firstMeaning = entry.meanings?.[0];
      const meta: DictionaryWordMeta = {
        phonetic: rawPhonetic || undefined,
        partOfSpeech: firstMeaning?.partOfSpeech,
        definition: firstMeaning?.definitions?.[0]?.definition,
      };
      wordMetaCache.set(cleaned, meta);
      return meta;
    }
  } catch {
    // Ignore dictionary enrichment / timeout errors
  } finally {
    clearTimeout(timeoutId);
  }
  return {};
}

/**
 * Optional Free Dictionary API enrichment (IPA phonetics / part of speech for words & short phrases)
 */
async function fetchWordDictionaryMeta(text: string): Promise<DictionaryWordMeta> {
  const normalized = text.trim().replace(/\s+/g, ' ');
  if (!normalized) return {};

  const offlineIpa = OFFLINE_GLOSSARY_IPA[normalized.toLowerCase()];
  const words = normalized.split(' ');

  if (words.length === 1) {
    const meta = await fetchSingleWordMeta(words[0]);
    return {
      ...meta,
      phonetic: meta.phonetic || offlineIpa,
    };
  }

  if (offlineIpa) {
    return { phonetic: offlineIpa };
  }

  if (words.length <= 5) {
    const metas = await Promise.all(words.map((w) => fetchSingleWordMeta(w)));
    const hasAnyIpa = metas.some((m) => Boolean(m.phonetic));
    if (hasAnyIpa) {
      const joined = words
        .map((w, idx) => {
          const ipa = metas[idx]?.phonetic;
          return ipa ? stripIpaDelimiters(ipa) : w.toLowerCase();
        })
        .filter(Boolean)
        .join(' ');
      if (joined) {
        return { phonetic: `/${joined}/` };
      }
    }
  }

  return {};
}

/**
 * Standalone IPA lookup helper (used for hover backfill on previously saved words)
 */
export async function lookupIpa(rawText: string): Promise<string | undefined> {
  const meta = await fetchWordDictionaryMeta(rawText);
  return meta.phonetic;
}

/**
 * Parse structured JSON returned by Gemini/OpenAI context-aware prompts,
 * with safe fallback to plain text if the model does not return valid JSON.
 */
export function parseStructuredLlmTranslation(raw: string): {
  translatedText: string;
  partOfSpeech?: string;
  alternativeMeanings?: string[];
} {
  const trimmed = raw.trim();
  const fenced = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(fenced) as {
      meaning?: unknown;
      partOfSpeech?: unknown;
      alternatives?: unknown;
    };
    if (typeof parsed.meaning === 'string' && parsed.meaning.trim()) {
      const meaning = parsed.meaning.trim();
      const pos =
        typeof parsed.partOfSpeech === 'string' && parsed.partOfSpeech.trim()
          ? parsed.partOfSpeech.trim().toLowerCase()
          : undefined;
      const alts = Array.isArray(parsed.alternatives)
        ? dedupeAlternatives(
            meaning,
            parsed.alternatives.filter((x): x is string => typeof x === 'string'),
            5
          )
        : [];
      return {
        translatedText: meaning,
        partOfSpeech: pos,
        alternativeMeanings: alts.length > 0 ? alts : undefined,
      };
    }
  } catch {
    // Fallback to plain text below
  }

  return { translatedText: trimmed };
}

function buildContextLlmPrompt(
  text: string,
  targetLang: string,
  context: TranslationContext
): string {
  const paragraph = (context.paragraph || context.sentence || '').trim();
  const titleLine = context.pageTitle ? `Article title: ${context.pageTitle}\n` : '';
  return (
    `Translate the target word/phrase into language code "${targetLang}" strictly according to how it is used in the surrounding context.\n` +
    `${titleLine}` +
    `Context: "${paragraph}"\n` +
    `Target word/phrase: "${text}"\n\n` +
    `Return ONLY a JSON object with this exact schema:\n` +
    `{"meaning":"<most accurate concise translation for this context>","partOfSpeech":"<noun|verb|adjective|adverb|preposition|phrase|etc>","alternatives":["<other common meaning 1>","<other common meaning 2>"]}`
  );
}

/**
 * 2. Gemini API Translation (Optional Custom Provider)
 */
async function translateWithGemini(
  text: string,
  targetLang: string,
  apiKey: string,
  context?: TranslationContext
): Promise<ProviderTranslationOutput> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;
  const useContext = shouldUseWordContext(text, context);
  const prompt =
    useContext && context
      ? buildContextLlmPrompt(text, targetLang, context)
      : `Translate the following text into language code "${targetLang}". Return ONLY the concise translated meaning without quotes or explanations:\n\n${text}`;

  const generationConfig: Record<string, unknown> = {
    temperature: 0.1,
    maxOutputTokens: useContext ? 220 : 160,
  };
  if (useContext) {
    generationConfig.responseMimeType = 'application/json';
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig,
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API HTTP ${res.status}`);
  }
  const data = await res.json();
  const output = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!output) throw new Error('Empty Gemini response');

  if (useContext) {
    const parsed = parseStructuredLlmTranslation(output);
    return {
      ...parsed,
      contextUsed: true,
    };
  }
  return { translatedText: output };
}

/**
 * 3. OpenAI API Translation (Optional Custom Provider)
 */
async function translateWithOpenAI(
  text: string,
  targetLang: string,
  apiKey: string,
  context?: TranslationContext
): Promise<ProviderTranslationOutput> {
  const useContext = shouldUseWordContext(text, context);
  const body: Record<string, unknown> = {
    model: 'gpt-4o-mini',
    temperature: 0.1,
    messages:
      useContext && context
        ? [
            {
              role: 'system',
              content:
                'You are a precise contextual dictionary translator. Always output valid JSON matching the requested schema.',
            },
            {
              role: 'user',
              content: buildContextLlmPrompt(text, targetLang, context),
            },
          ]
        : [
            {
              role: 'system',
              content: `You are a concise translator. Translate user text into "${targetLang}". Output only the translation.`,
            },
            { role: 'user', content: text },
          ],
  };

  if (useContext) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API HTTP ${res.status}`);
  }
  const data = await res.json();
  const output = data?.choices?.[0]?.message?.content?.trim();
  if (!output) throw new Error('Empty OpenAI response');

  if (useContext) {
    const parsed = parseStructuredLlmTranslation(output);
    return {
      ...parsed,
      contextUsed: true,
    };
  }
  return { translatedText: output };
}

/**
 * 4. DeepL API Translation (Optional Custom Provider)
 * Uses DeepL's official non-billed `context` parameter when surrounding paragraph is available.
 */
async function translateWithDeepL(
  text: string,
  targetLang: string,
  apiKey: string,
  context?: TranslationContext
): Promise<ProviderTranslationOutput> {
  const isFreeKey = apiKey.endsWith(':fx');
  const host = isFreeKey ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
  const useContext = shouldUseWordContext(text, context);
  const contextText = (context?.paragraph || context?.sentence || '').trim();

  const body = new URLSearchParams({
    text,
    target_lang: targetLang.toUpperCase().split('-')[0],
  });
  if (useContext && contextText) {
    body.append('context', contextText);
  }

  const res = await fetch(`${host}/v2/translate`, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`DeepL API HTTP ${res.status}`);
  }
  const data = await res.json();
  const output = data?.translations?.[0]?.text?.trim();
  if (!output) throw new Error('Empty DeepL response');
  return {
    translatedText: output,
    contextUsed: Boolean(useContext && contextText),
  };
}

/**
 * Unified Translation Dispatcher (Used by Background Service Worker & Dev Workbench)
 */
export async function translateText(
  rawText: string,
  targetLang: string,
  settings: Pick<ExtensionSettings, 'translationProvider' | 'apiKey'> & {
    enableContextTranslation?: boolean;
  },
  context?: TranslationContext
): Promise<TranslationResult> {
  const sourceText = rawText.trim().replace(/\s+/g, ' ');
  const provider = settings.translationProvider || 'google';
  const apiKey = settings.apiKey?.trim() || '';
  const activeContext =
    settings.enableContextTranslation === false ? undefined : context;

  const dictPromise = fetchWordDictionaryMeta(sourceText);

  try {
    let providerRes: ProviderTranslationOutput;

    if (provider === 'gemini' && apiKey) {
      providerRes = await translateWithGemini(sourceText, targetLang, apiKey, activeContext);
    } else if (provider === 'openai' && apiKey) {
      providerRes = await translateWithOpenAI(sourceText, targetLang, apiKey, activeContext);
    } else if (provider === 'deepl' && apiKey) {
      providerRes = await translateWithDeepL(sourceText, targetLang, apiKey, activeContext);
    } else {
      providerRes = await translateWithGoogleFree(sourceText, targetLang, activeContext);
    }

    const dictMeta = await dictPromise;
    return {
      sourceText,
      translatedText: providerRes.translatedText,
      targetLang,
      detectedSourceLang: providerRes.detectedSourceLang,
      phonetic: dictMeta.phonetic,
      partOfSpeech: providerRes.partOfSpeech || dictMeta.partOfSpeech,
      alternativeMeanings: providerRes.alternativeMeanings,
      contextUsed: providerRes.contextUsed,
      provider,
    };
  } catch {
    // Fallback 1: If custom provider failed, attempt Google Free endpoint
    if (provider !== 'google') {
      try {
        const googleRes = await translateWithGoogleFree(
          sourceText,
          targetLang,
          activeContext
        );
        const dictMeta = await dictPromise;
        return {
          sourceText,
          translatedText: googleRes.translatedText,
          targetLang,
          detectedSourceLang: googleRes.detectedSourceLang,
          phonetic: dictMeta.phonetic,
          partOfSpeech: googleRes.partOfSpeech || dictMeta.partOfSpeech,
          alternativeMeanings: googleRes.alternativeMeanings,
          contextUsed: googleRes.contextUsed,
          provider: 'google',
        };
      } catch {
        // Proceed to local dictionary fallback below
      }
    }

    // Fallback 2: Offline Glossary / Dictionary Definition (ensures Dev Workbench & offline mode always succeed)
    const dictMeta = await dictPromise;
    const lower = sourceText.toLowerCase();
    const glossaryMatch = OFFLINE_GLOSSARY_VI[lower];

    const fallbackMeaning =
      glossaryMatch ||
      dictMeta.definition ||
      `[${targetLang.toUpperCase()}] Bản dịch của "${sourceText}"`;

    return {
      sourceText,
      translatedText: fallbackMeaning,
      targetLang,
      phonetic: dictMeta.phonetic,
      partOfSpeech: dictMeta.partOfSpeech,
      provider: 'dictionary-fallback',
    };
  }
}
