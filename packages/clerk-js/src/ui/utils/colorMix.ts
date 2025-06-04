/**
 * Transparentize a color by a percentage
 * @param color - The color to transparentize
 * @param percentage - The percentage to transparentize the color by
 * @returns The transparentized color
 */
export function transparentize(color: string, percentage: number) {
  return `color-mix(in oklch, ${color} ${percentage}, transparent)`;
}

/**
 * Lighten a color by a percentage
 * @param color - The color to lighten
 * @param percentage - The percentage to lighten the color by
 * @returns The lightened color
 */
export function lighten(color: string, percentage: number) {
  return `color-mix(in oklch, ${color} ${percentage}, white)`;
}

/**
 * Darken a color by a percentage
 * @param color - The color to darken
 * @param percentage - The percentage to darken the color by
 * @returns The darkened color
 */
export function darken(color: string, percentage: number) {
  return `color-mix(in oklch, ${color} ${percentage}, black)`;
}

/**
 * Tint a color by a percentage
 * @param color - The color to tint
 * @param colorTint - The color to tint the color with
 * @param percentage - The percentage to tint the color by
 * @returns The tinted color
 */
export function tint(color: string, colorTint: string, percentage: number) {
  return `color-mix(in oklch, ${color} ${percentage}, ${colorTint})`;
}
