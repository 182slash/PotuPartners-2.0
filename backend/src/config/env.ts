import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // ── Server ──────────────────────────────────────────────────────────────
  NODE_ENV:    z.enum(['development', 'production', 'test']).default('development'),
  PORT:        z.string().default('4000').transform(Number),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // ── PostgreSQL (injected by DO App Platform dev database) ────────────────
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // ── JWT ──────────────────────────────────────────────────────────────────
  JWT_ACCESS_SECRET:      z.string().min(32, 'JWT_ACCESS_SECRET must be ≥ 32 chars'),
  JWT_REFRESH_SECRET:     z.string().min(32, 'JWT_REFRESH_SECRET must be ≥ 32 chars'),
  JWT_ACCESS_EXPIRES_IN:  z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // ── Local file storage (DO App Platform volume) ──────────────────────────
  // Must match the volume mount_path in .do/app.yaml.
  // Locally you can set this to ./uploads or any writable directory.
  UPLOAD_DIR: z.string().default('/workspace/uploads'),

  // ── RAG Service ──────────────────────────────────────────────────────────
  RAG_SERVICE_URL:    z.string().url().default('http://localhost:8000'),
  RAG_SERVICE_SECRET: z.string().min(16, 'RAG_SERVICE_SECRET must be ≥ 16 chars'),

  // ── OpenAI ───────────────────────────────────────────────────────────────
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),

  // ── Logging ──────────────────────────────────────────────────────────────
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // ── BCrypt ───────────────────────────────────────────────────────────────
  BCRYPT_ROUNDS: z.string().default('12').transform(Number),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('\n❌  Invalid environment variables:\n');
    result.error.issues.forEach(issue => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });
    console.error('\nFix the above variables in your .env file and restart.\n');
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
export type Env  = typeof env;
