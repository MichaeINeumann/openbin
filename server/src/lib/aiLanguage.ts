import { query } from '../db.js';
import { HARDENING_INSTRUCTION } from './aiSanitize.js';

/** Profile preferences are authoritative; absent preferences always mean German. */
export async function getAiLanguage(userId?: string): Promise<string> {
  if (!userId) return 'de-DE';
  const result = await query<{ language: string | null }>('SELECT language FROM users WHERE id = $1', [userId]);
  const language = result.rows[0]?.language;
  return language === 'en' || language === 'nb' ? language : 'de-DE';
}

function languageName(language: string): string {
  return language === 'en' ? 'English' : language === 'nb' ? 'Norwegian Bokmål' : 'German (Deutsch)';
}

/**
 * Append at request time: never rewrite stored custom prompts or inventory names.
 *
 * The directive is split in two. A one-line lead goes near the TOP — right after
 * the security block when one is present — because the same attention decay that
 * HARDENING_INSTRUCTION is positioned around also swallows a language
 * instruction left in the tail of a long prompt (reorganize in particular). The
 * detailed rules about what must NOT be translated stay at the end, where they
 * sit next to the output-format rules they qualify.
 */
export function withAiLanguage(prompt: string, language = 'de-DE'): string {
  const name = languageName(language);
  const lead = `RESPONSE LANGUAGE: ${name}. Write every answer, interpretation, explanation, suggestion and newly generated name in this language.`;
  const detail = `Response language: ${name}. Use this language for newly generated item names, descriptions, explanations, suggestions and answers unless the user's custom instructions explicitly request another language. Keep existing inventory names, proper names, identifiers, JSON keys, enum values, API fields and schemas unchanged. For German, for example, name newly recognized M2 screws "M2 Schrauben". Interpret search questions in this language, matching the original stored inventory names without translating or renaming them.`;

  // Keep the security rules in first position; the language lead follows them.
  if (prompt.startsWith(HARDENING_INSTRUCTION)) {
    const rest = prompt.slice(HARDENING_INSTRUCTION.length).replace(/^\n+/, '');
    return `${HARDENING_INSTRUCTION}\n\n${lead}\n\n${rest}\n\n${detail}`;
  }
  return `${lead}\n\n${prompt}\n\n${detail}`;
}
