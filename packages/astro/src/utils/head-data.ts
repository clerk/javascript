export const CLERK_ASTRO_DATA = 'clerk-astro-data';
export const CLERK_ASTRO_SAFE_VARS = 'clerk-astro-safe-vars';

export function encodeHeadData(value: unknown): string {
  let binary = '';
  for (const byte of new TextEncoder().encode(JSON.stringify(value))) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function readHeadData<T>(name: string): T | undefined {
  const content = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content;
  if (!content) {
    return undefined;
  }
  const binary = atob(content.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0))));
}
