export function inBrowser(): boolean {
  return typeof window !== 'undefined';
}
