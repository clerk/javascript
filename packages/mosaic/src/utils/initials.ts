/** Up to two capital letters from the first two words of `name`, or `?` when it has none. */
export function initials(name: string): string {
  const [first = '', second = ''] = name.trim().split(/\s+/);
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase() || '?';
}
