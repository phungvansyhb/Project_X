import { ExtensionSettings, TranslationProvider } from '../shared/storage';

export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  targetLang: string;
  detectedSourceLang?: string;
  phonetic?: string;
  partOfSpeech?: string;
  provider: TranslationProvider | 'dictionary-fallback';
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

/**
 * 1. Free Google Translate Web Endpoint (Zero-Config Default)
 */
async function translateWithGoogleFree(
  text: string,
  targetLang: string
): Promise<{ translatedText: string; detectedSourceLang?: string }> {
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto` +
    `&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Google Translate HTTP ${res.status}`);
  }

  const data = await res.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const translatedText = data[0]
      .map((segment: unknown) => (Array.isArray(segment) ? segment[0] : ''))
      .join('')
      .trim();
    const detectedSourceLang = typeof data[2] === 'string' ? data[2] : undefined;
    if (translatedText) {
      return { translatedText, detectedSourceLang };
    }
  }
  throw new Error('Empty response from Google Translate');
}

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
 * 2. Gemini API Translation (Optional Custom Provider)
 */
async function translateWithGemini(
  text: string,
  targetLang: string,
  apiKey: string
): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;
  const prompt = `Translate the following text into language code "${targetLang}". Return ONLY the concise translated meaning without quotes or explanations:\n\n${text}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 160 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API HTTP ${res.status}`);
  }
  const data = await res.json();
  const output = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!output) throw new Error('Empty Gemini response');
  return output;
}

/**
 * 3. OpenAI API Translation (Optional Custom Provider)
 */
async function translateWithOpenAI(
  text: string,
  targetLang: string,
  apiKey: string
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: `You are a concise translator. Translate user text into "${targetLang}". Output only the translation.`,
        },
        { role: 'user', content: text },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API HTTP ${res.status}`);
  }
  const data = await res.json();
  const output = data?.choices?.[0]?.message?.content?.trim();
  if (!output) throw new Error('Empty OpenAI response');
  return output;
}

/**
 * 4. DeepL API Translation (Optional Custom Provider)
 */
async function translateWithDeepL(
  text: string,
  targetLang: string,
  apiKey: string
): Promise<string> {
  const isFreeKey = apiKey.endsWith(':fx');
  const host = isFreeKey ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
  const body = new URLSearchParams({
    text,
    target_lang: targetLang.toUpperCase().split('-')[0],
  });

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
  return output;
}

/**
 * Unified Translation Dispatcher (Used by Background Service Worker & Dev Workbench)
 */
export async function translateText(
  rawText: string,
  targetLang: string,
  settings: Pick<ExtensionSettings, 'translationProvider' | 'apiKey'>
): Promise<TranslationResult> {
  const sourceText = rawText.trim().replace(/\s+/g, ' ');
  const provider = settings.translationProvider || 'google';
  const apiKey = settings.apiKey?.trim() || '';

  const dictPromise = fetchWordDictionaryMeta(sourceText);

  try {
    let translatedText = '';
    let detectedSourceLang: string | undefined;

    if (provider === 'gemini' && apiKey) {
      translatedText = await translateWithGemini(sourceText, targetLang, apiKey);
    } else if (provider === 'openai' && apiKey) {
      translatedText = await translateWithOpenAI(sourceText, targetLang, apiKey);
    } else if (provider === 'deepl' && apiKey) {
      translatedText = await translateWithDeepL(sourceText, targetLang, apiKey);
    } else {
      const googleRes = await translateWithGoogleFree(sourceText, targetLang);
      translatedText = googleRes.translatedText;
      detectedSourceLang = googleRes.detectedSourceLang;
    }

    const dictMeta = await dictPromise;
    return {
      sourceText,
      translatedText,
      targetLang,
      detectedSourceLang,
      phonetic: dictMeta.phonetic,
      partOfSpeech: dictMeta.partOfSpeech,
      provider,
    };
  } catch {
    // Fallback 1: If custom provider failed, attempt Google Free endpoint
    if (provider !== 'google') {
      try {
        const googleRes = await translateWithGoogleFree(sourceText, targetLang);
        const dictMeta = await dictPromise;
        return {
          sourceText,
          translatedText: googleRes.translatedText,
          targetLang,
          detectedSourceLang: googleRes.detectedSourceLang,
          phonetic: dictMeta.phonetic,
          partOfSpeech: dictMeta.partOfSpeech,
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
