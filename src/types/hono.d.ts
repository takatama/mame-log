import { ContextVariableMap } from 'hono';

declare module 'hono' {
  interface ContextVariableMap {
    user: {
      id: number;
      sub: string;
      email: string;
      name?: string;
      photo_url?: string;
      terms_agreed_at?: string | null;
      created_at: string;
    };
  }
}
