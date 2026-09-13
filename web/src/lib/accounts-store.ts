import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { getDataDir } from '@/lib/data-dir';

const FILE = join(getDataDir(), 'accounts.json');

export interface Account {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export class AccountExistsError extends Error {
  constructor() {
    super('An account with this email already exists.');
    this.name = 'AccountExistsError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

async function readAccounts(): Promise<Account[]> {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return JSON.parse(raw) as Account[];
  } catch {
    return [];
  }
}

async function writeAccounts(accounts: Account[]): Promise<void> {
  await fs.mkdir(getDataDir(), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(accounts, null, 2), 'utf8');
}

export async function registerAccount(input: {
  name?: string;
  email?: string;
  password?: string;
}): Promise<Account> {
  const name = input.name?.trim() ?? '';
  const email = input.email?.toLowerCase().trim() ?? '';
  const password = input.password ?? '';

  if (!name) throw new ValidationError('Your full name is required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError('A valid email is required.');
  }
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters.');
  }

  if (email === (process.env.DEMO_EMAIL ?? 'demo@leadpilot.io').toLowerCase()) {
    throw new ValidationError('That email is reserved for the demo account.');
  }

  const accounts = await readAccounts();
  if (accounts.some((a) => a.email === email)) throw new AccountExistsError();

  const account: Account = {
    id: `acc-${Date.now()}-${randomBytes(4).toString('hex')}`,
    name,
    email,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  accounts.push(account);
  await writeAccounts(accounts);
  return account;
}

export async function authenticate(email: string, password: string): Promise<Account | undefined> {
  const normalized = email.toLowerCase().trim();
  if (!normalized || !password) return undefined;
  const accounts = await readAccounts();
  const account = accounts.find((a) => a.email === normalized);
  if (!account) return undefined;
  return verifyPassword(password, account.passwordHash) ? account : undefined;
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$1$${salt}$${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'scrypt') return false;
  const [, , salt, hash] = parts;
  const computed = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return computed.length === expected.length && timingSafeEqual(computed, expected);
}