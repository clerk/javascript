const SLUG_PATTERN = /^(?=.*[a-z0-9])[a-z0-9-]+$/;

export function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

export function isSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}
