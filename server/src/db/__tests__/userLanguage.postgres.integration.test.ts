import { Pool } from 'pg';
import { describe, expect, it } from 'vitest';
import { userLanguage } from '../migrations/0014_user_language.js';

// Explicit opt-in: use an isolated test database, never a production URL.
const testUrl = process.env.TEST_POSTGRES_URL;
describe.skipIf(!testUrl)('PostgreSQL user language migration', () => {
  it('preserves existing users and preferences across repeated migrations', async () => {
    const pool = new Pool({ connectionString: testUrl, max: 1 });
    try {
      await pool.query('BEGIN');
      await pool.query('CREATE TEMP TABLE users (id text PRIMARY KEY, display_name text NOT NULL, email text NOT NULL)');
      await pool.query("INSERT INTO users VALUES ('test-user', 'Müller', 'test@example.test')");
      await userLanguage.postgres!(pool);
      expect((await pool.query('SELECT * FROM users')).rows).toEqual([
        { id: 'test-user', display_name: 'Müller', email: 'test@example.test', language: null },
      ]);
      await pool.query("UPDATE users SET language = 'de-DE'");
      await userLanguage.postgres!(pool);
      expect((await pool.query('SELECT language FROM users')).rows[0].language).toBe('de-DE');
      await pool.query('ROLLBACK');
    } finally {
      await pool.end();
    }
  });
});
