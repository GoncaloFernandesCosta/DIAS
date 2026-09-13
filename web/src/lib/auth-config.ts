export const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTH_SECRET ??
  'leadpilot-demo-secret-CHANGE-ME-for-production';

export function isGoogleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}