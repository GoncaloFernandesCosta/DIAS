import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { AUTH_SECRET, isGoogleConfigured } from '@/lib/auth-config';
import { authenticate } from '@/lib/accounts-store';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: buildProviders(),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.id === 'string') {
        (session.user as { id: string }).id = token.id;
      }
      return session;
    },
  },
  secret: AUTH_SECRET,
};

function buildProviders(): NextAuthOptions['providers'] {
  const providers: NextAuthOptions['providers'] = [];

  if (isGoogleConfigured()) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      }),
    );
  }

  providers.push(
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;

        if (!email || !password) return null;

        const demoEmail = (process.env.DEMO_EMAIL ?? 'demo@leadpilot.io').toLowerCase().trim();
        const demoPassword = process.env.DEMO_PASSWORD ?? 'demo1234';

        if (email === demoEmail && password === demoPassword) {
          return {
            id: 'demo-user',
            name: 'Demo User',
            email,
          };
        }

        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
          return {
            id: 'admin-user',
            name: 'Admin',
            email,
          };
        }

        const account = await authenticate(email, password);
        if (account) {
          return {
            id: account.id,
            name: account.name,
            email: account.email,
          };
        }

        return null;
      },
    }),
  );

  return providers;
}