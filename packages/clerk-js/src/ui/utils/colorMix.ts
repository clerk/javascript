/**
 * Mix a color with a color tint
 * @param color - The color to mix
 * @param percentage - The percentage to mix the color with
 * @param colorTint - The color to mix the color with
 * @returns The mixed color
 */
export function colorMix(color: string, percentage: number, colorTint: string) {
  return `color-mix(in oklch, ${color} ${percentage}, ${colorTint})`;
}

/**
 * Transparentize a color by a percentage
 * @param color - The color to transparentize
 * @param percentage - The percentage to transparentize the color by
 * @returns The transparentized color
 */
export function transparentize(color: string, percentage: number) {
  return colorMix(color, percentage, 'transparent');
}

/**
 * Lighten a color by a percentage
 * @param color - The color to lighten
 * @param percentage - The percentage to lighten the color by
 * @returns The lightened color
 */
export function lighten(color: string, percentage: number) {
  return colorMix(color, percentage, 'white');
}

/**
 * Darken a color by a percentage
 * @param color - The color to darken
 * @param percentage - The percentage to darken the color by
 * @returns The darkened color
 */
export function darken(color: string, percentage: number) {
  return colorMix(color, percentage, 'black');
}
