import { ContextVariableMap } from 'hono';

declare module 'hono' {
  interface ContextVariableMap {
    user: {
      id: number;
    };
  }
}
