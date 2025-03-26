/**
 * Normalizes color format strings by removing alpha values if present
 * Handles conversions between:
 * - Hex: #RGB, #RGBA, #RRGGBB, #RRGGBBAA → #RGB or #RRGGBB
 * - RGB: rgb(r, g, b), rgba(r, g, b, a) → rgb(r, g, b)
 * - HSL: hsl(h, s%, l%), hsla(h, s%, l%, a) → hsl(h, s%, l%)
 *
 * @param colorString - The color string to normalize
 * @returns The normalized color string without alpha components, or the original string if invalid
 */
export function normalizeColorString(colorString: string): string {
  if (!colorString || typeof colorString !== 'string') {
    console.warn('Invalid input: color string must be a non-empty string');
    return colorString || '';
  }

  const trimmed = colorString.trim();

  // Handle empty strings
  if (trimmed === '') {
    console.warn('Invalid input: color string cannot be empty');
    return '';
  }

  // Handle hex colors
  if (trimmed.startsWith('#')) {
    // Validate hex format
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(trimmed)) {
      console.warn(`Invalid hex color format: ${colorString}`);
      return trimmed;
    }

    // #RGBA format (4 chars)
    if (trimmed.length === 5) {
      return '#' + trimmed.slice(1, 4);
    }
    // #RRGGBBAA format (9 chars)
    if (trimmed.length === 9) {
      return '#' + trimmed.slice(1, 7);
    }
    // Regular hex formats (#RGB, #RRGGBB)
    return trimmed;
  }

  // Handle rgb/rgba
  if (/^rgba?\(/.test(trimmed)) {
    // Extract and normalize rgb values
    const rgbMatch = trimmed.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    if (rgbMatch) {
      // Already in rgb format, normalize whitespace
      return `rgb(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]})`;
    }

    // Extract and normalize rgba values
    const rgbaMatch = trimmed.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/);
    if (rgbaMatch) {
      // Convert rgba to rgb, normalize whitespace
      return `rgb(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]})`;
    }

    console.warn(`Invalid RGB/RGBA format: ${colorString}`);
    return trimmed;
  }

  // Handle hsl/hsla
  if (/^hsla?\(/.test(trimmed)) {
    // Extract and normalize hsl values
    const hslMatch = trimmed.match(/^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/);
    if (hslMatch) {
      // Already in hsl format, normalize whitespace
      return `hsl(${hslMatch[1]}, ${hslMatch[2]}%, ${hslMatch[3]}%)`;
    }

    // Extract and normalize hsla values
    const hslaMatch = trimmed.match(/^hsla\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([\d.]+)\s*\)$/);
    if (hslaMatch) {
      // Convert hsla to hsl, normalize whitespace
      return `hsl(${hslaMatch[1]}, ${hslaMatch[2]}%, ${hslaMatch[3]}%)`;
    }

    console.warn(`Invalid HSL/HSLA format: ${colorString}`);
    return trimmed;
  }

  // If we reach here, the input is not a recognized color format
  console.warn(`Unrecognized color format: ${colorString}`);
  return trimmed;
}
