import { NextResponse } from 'next/server';
import { isGoogleConfigured } from '@/lib/auth-config';

export async function GET() {
  return NextResponse.json({
    googleConfigured: isGoogleConfigured(),
    demo: {
      email: process.env.DEMO_EMAIL ?? 'demo@leadpilot.io',
      password: process.env.DEMO_PASSWORD ?? 'demo1234',
    },
    vercel: Boolean(process.env.VERCEL),
  });
}