declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): { [key: string]: string };
  }

  export const env: Env;
}

// Fix for array.push type issues
interface Array<T> {
  push(...items: T[]): number;
} 