import { resolve } from 'node:path';

export function isVercel(): boolean {
  return Boolean(process.env.VERCEL);
}

export function getDataDir(): string {
  if (process.env.DIAS_DATA_DIR) return resolve(process.env.DIAS_DATA_DIR);
  if (isVercel()) return '/tmp/leadpilot';
  return resolve(process.cwd(), '.dias', 'data');
}