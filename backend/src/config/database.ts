import { Pool, type PoolClient } from 'pg';
import { env } from './env';
import { logger } from '../utils/logger';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl:              env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max:              20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('connect', () => {
  logger.debug('New PostgreSQL connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL client error', { error: err.message });
});

// ─── Query helper ─────────────────────────────────────────────────────────────
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number | null }> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const ms     = Date.now() - start;
    if (ms > 500) {
      logger.warn('Slow query detected', { text: text.slice(0, 80), ms });
    }
    return { rows: result.rows as T[], rowCount: result.rowCount };
  } catch (err) {
    logger.error('Database query failed', {
      text: text.slice(0, 100),
      error: (err as Error).message,
    });
    throw err;
  }
}

// ─── Transaction helper ───────────────────────────────────────────────────────
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ─── Health check ─────────────────────────────────────────────────────────────
export async function checkDbConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    logger.info('✅  PostgreSQL connection verified');
  } finally {
    client.release();
  }
}

export default pool;
