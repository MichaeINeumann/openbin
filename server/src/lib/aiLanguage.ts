import { query } from '../db.js';

/** Profile preferences are authoritative; absent preferences always mean German. */
export async function getAiLanguage(userId?: string): Promise<string> {
  if (!userId) return 'de-DE';
  const result = await query<{ language: string | null }>('SELECT language FROM users WHERE id = $1', [userId]);
  const language = result.rows[0]?.language;
  return language === 'en' || language === 'nb' ? language : 'de-DE';
}

/** Append at request time: never rewrite stored custom prompts or inventory names. */
export function withAiLanguage(prompt: string, language = 'de-DE'): string {
  const name = language === 'en' ? 'English' : language === 'nb' ? 'Norwegian Bokmål' : 'German (Deutsch)';
  return `${prompt}\n\nResponse language: ${name}. Use this language for newly generated item names, descriptions, explanations, suggestions and answers unless the user's custom instructions explicitly request another language. Keep existing inventory names, proper names, identifiers, JSON keys, enum values, API fields and schemas unchanged. For German, for example, name newly recognized M2 screws "M2 Schrauben". Interpret search questions in this language, matching the original stored inventory names without translating or renaming them.`;
}
