export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>;
  saveToken: (key: string, token: string) => Promise<void>;
}

const cache: Record<string, string> = {};

export async function saveToken(key: string, value: string): Promise<void> {
  cache[key] = value;
}

export async function getToken(key: string): Promise<string> {
  return cache[key];
}
