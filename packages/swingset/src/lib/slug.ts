export function toSlug(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-/, '')
    .toLowerCase();
}
