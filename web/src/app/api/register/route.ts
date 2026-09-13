import { NextRequest, NextResponse } from 'next/server';
import { AccountExistsError, ValidationError, registerAccount } from '@/lib/accounts-store';

export async function POST(request: NextRequest) {
  const body: { name?: string; email?: string; password?: string } = await request
    .json()
    .catch(() => ({}));

  try {
    await registerAccount({
      name: body.name,
      email: body.email,
      password: body.password,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof AccountExistsError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create account.' }, { status: 500 });
  }
}