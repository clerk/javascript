/**
 * Strip trailing `/` characters from a string. Linear-time loop instead of a regex so
 * we don't trip CodeQL's polynomial-regex check on inputs with many repeated slashes.
 */
export function stripTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47 /* '/' */) {
    end--;
  }
  return end === value.length ? value : value.slice(0, end);
}
