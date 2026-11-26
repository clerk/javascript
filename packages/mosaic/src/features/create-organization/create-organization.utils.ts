const SLUG_PATTERN = /^(?=.*[a-z0-9])[a-z0-9-]+$/;

export function toSlug(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}
