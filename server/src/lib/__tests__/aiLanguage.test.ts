import { describe, expect, it } from 'vitest';
import { query } from '../../db.js';
import { getAiLanguage, withAiLanguage } from '../aiLanguage.js';
import { HARDENING_INSTRUCTION, withHardening } from '../aiSanitize.js';

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
    expect(prompt).toContain(custom);
    expect(prompt).toContain('custom instructions explicitly request another language');
    expect(prompt).toContain('JSON keys');
    expect(withAiLanguage(custom, 'en')).toContain('Response language: English');
    expect(withAiLanguage(custom, 'nb')).toContain('Norwegian Bokmål');
  });

  it('leads with the language directive instead of burying it in the tail', () => {
    const prompt = withAiLanguage('Recognize items', 'de-DE');
    // A long prompt loses its tail to attention decay, so the directive has to
    // appear before the body as well as after it.
    expect(prompt.indexOf('RESPONSE LANGUAGE')).toBeLessThan(prompt.indexOf('Recognize items'));
    expect(prompt).toContain('German (Deutsch)');
  });

  it('keeps the security rules in first position when they are present', () => {
    const prompt = withAiLanguage(withHardening('Recognize items'), 'de-DE');
    expect(prompt.startsWith(HARDENING_INSTRUCTION)).toBe(true);
    expect(prompt.indexOf('RESPONSE LANGUAGE')).toBeLessThan(prompt.indexOf('Recognize items'));
    // The security block must not be duplicated by the insertion.
    expect(prompt.split('IMPORTANT — SECURITY RULES').length - 1).toBe(1);
  });
});
