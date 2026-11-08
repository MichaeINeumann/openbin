import { describe, expect, it } from 'vitest';
import { query } from '../../db.js';
import { getAiLanguage, withAiLanguage } from '../aiLanguage.js';

describe('AI response language', () => {
  it('defaults to German without a stored preference', async () => {
    expect(await getAiLanguage()).toBe('de-DE');
    expect(await getAiLanguage('missing-user')).toBe('de-DE');
    expect(withAiLanguage('Recognize items')).toContain('M2 Schrauben');
  });
  it('reads the current user preference independently for each request', async () => {
    await query("INSERT INTO users (id, email, display_name, password_hash, language) VALUES ($1, $2, $3, $4, $5)", ['lang-user', 'lang-user@example.test', 'Test', 'hash', 'en']);
    expect(await getAiLanguage('lang-user')).toBe('en');
    await query('UPDATE users SET language = $1 WHERE id = $2', ['nb', 'lang-user']);
    expect(await getAiLanguage('lang-user')).toBe('nb');
  });
  it('preserves custom prompts and protects schema and stored names', () => {
    const custom = 'Use my custom categories. Answer in French.';
    const prompt = withAiLanguage(custom, 'de-DE');
    expect(prompt.startsWith(custom)).toBe(true);
    expect(prompt).toContain('custom instructions explicitly request another language');
    expect(prompt).toContain('JSON keys');
    expect(withAiLanguage(custom, 'en')).toContain('Response language: English');
    expect(withAiLanguage(custom, 'nb')).toContain('Norwegian Bokmål');
  });
});
