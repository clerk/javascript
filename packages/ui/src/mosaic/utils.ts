/** Applies opacity to any CSS color via `color-mix`. */
export function alpha(color: string, opacity: number): string {
  return `color-mix(in oklab, ${color} ${opacity}%, transparent)`;
}
