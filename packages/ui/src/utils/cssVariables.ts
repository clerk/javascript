/**
 * Extracts the computed value of a CSS custom property (CSS variable)
 * @param variableName - The CSS variable name in any of these formats:
 *   - 'var(--color)'
 *   - '--color'
 *   - 'color' (will be prefixed with --)
 * @param element - Optional element to get the variable from (defaults to document.documentElement)
 * @returns The computed CSS variable value as a string, or null if not found
 * @example
 * const colorValue = extractCSSVariableValue('var(--color)'); // "red"
 * const colorValue2 = extractCSSVariableValue('--color'); // "red"
 * const colorValue3 = extractCSSVariableValue('color'); // "red"
 * const colorValue4 = extractCSSVariableValue('--nonexistent'); // null
 * const colorValue5 = extractCSSVariableValue('--nonexistent', document.body); // null
 * const colorValue6 = extractCSSVariableValue('--nonexistent', document.body, '#000000'); // "#000000"
 */
export function extractCSSVariableValue(variableName: string, element?: Element): string | null {
  // Handle both browser and server environments
  if (typeof window === 'undefined' || typeof getComputedStyle === 'undefined') {
    return null;
  }

  // Handle different input formats
  let cleanVariableName: string;

  if (variableName.startsWith('var(') && variableName.endsWith(')')) {
    // Extract from 'var(--color)' format
    cleanVariableName = variableName.slice(4, -1).trim();
  } else if (variableName.startsWith('--')) {
    // Already in '--color' format
    cleanVariableName = variableName;
  } else {
    // Add -- prefix to 'color' format
    cleanVariableName = `--${variableName}`;
  }

  // Use provided element or default to document root
  // Handle cases where document might not be available or element might be null
  let targetElement: Element;
  try {
    if (element) {
      targetElement = element;
    } else if (typeof document !== 'undefined' && document.documentElement) {
      targetElement = document.documentElement;
    } else {
      return null;
    }
  } catch {
    return null;
  }

  // Get computed style and extract the variable value
  try {
    const computedStyle = getComputedStyle(targetElement);
    const value = computedStyle.getPropertyValue(cleanVariableName).trim();
    return value || null;
  } catch {
    return null;
  }
}

/**
 * Alternative version that also accepts fallback values
 * @param variableName - The CSS variable name
 * @param fallback - Fallback value if variable is not found
 * @param element - Optional element to get the variable from
 * @returns The CSS variable value or fallback
 */
export function extractCSSVariableValueWithFallback<T = string>(
  variableName: string,
  fallback: T,
  element?: Element,
): string | T {
  const value = extractCSSVariableValue(variableName, element);
  return value || fallback;
}

/**
 * Gets multiple CSS variables at once
 * @param variableNames - Array of CSS variable names
 * @param element - Optional element to get variables from
 * @returns Object mapping variable names to their values
 * @example
 * const variables = extractMultipleCSSVariables([
 *   '--primary-color',
 *   '--secondary-color',
 *   '--font-size'
 * ]);
 */
export function extractMultipleCSSVariables(variableNames: string[], element?: Element): Record<string, string | null> {
  return variableNames.reduce(
    (acc, varName) => {
      acc[varName] = extractCSSVariableValue(varName, element);
      return acc;
    },
    {} as Record<string, string | null>,
  );
}

/**
 * Checks if a given value represents a CSS variable (var() function)
 * @param value - The value to check
 * @returns True if the value is a CSS variable, false otherwise
 * @example
 * isCSSVariable('var(--color)'); // true
 * isCSSVariable('var(--color, red)'); // true
 * isCSSVariable('--color'); // false
 * isCSSVariable('red'); // false
 * isCSSVariable('#ff0000'); // false
 */
export function isCSSVariable(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();

  // Must start with var( and end with )
  if (!trimmed.startsWith('var(') || !trimmed.endsWith(')')) {
    return false;
  }

  // Extract content between var( and )
  const content = trimmed.slice(4, -1).trim();

  // Must start with --
  if (!content.startsWith('--')) {
    return false;
  }

  // Find the variable name (everything before the first comma, if any)
  const commaIndex = content.indexOf(',');
  const variableName = commaIndex === -1 ? content : content.slice(0, commaIndex).trim();

  // Variable name must be valid (--something)
  return /^--[a-zA-Z0-9-_]+$/.test(variableName);
}

/**
 * Resolves a CSS variable to its computed value, with fallback support
 * Handles var() syntax and extracts variable name and fallback value
 * @param value - The CSS variable string (e.g., 'var(--color, red)')
 * @param element - Optional element to get the variable from
 * @returns The resolved value or null if not found and no fallback provided
 * @example
 * resolveCSSVariable('var(--primary-color)'); // "blue" (if --primary-color is blue)
 * resolveCSSVariable('var(--missing-color, red)'); // "red" (fallback)
 * resolveCSSVariable('var(--missing-color)'); // null
 * resolveCSSVariable('red'); // null (not a CSS variable)
 */
export function resolveCSSVariable(value: string, element?: Element): string | null {
  if (!isCSSVariable(value)) {
    return null;
  }

  // Extract content between var( and )
  const content = value.trim().slice(4, -1).trim();

  // Find the variable name and fallback value
  const commaIndex = content.indexOf(',');
  let variableName: string;
  let fallbackValue: string | null = null;

  if (commaIndex === -1) {
    variableName = content;
  } else {
    variableName = content.slice(0, commaIndex).trim();
    fallbackValue = content.slice(commaIndex + 1).trim();
  }

  // Try to get the resolved variable value
  const resolvedValue = extractCSSVariableValue(variableName, element);

  if (resolvedValue) {
    return resolvedValue;
  }

  // If variable couldn't be resolved, check if fallback is also a CSS variable
  if (fallbackValue) {
    if (isCSSVariable(fallbackValue)) {
      // Recursively resolve nested CSS variables
      const recursiveResult = resolveCSSVariable(fallbackValue, element);
      return recursiveResult;
    }
    return fallbackValue;
  }

  return null;
}

/**
 * Resolves a CSS property to its computed value, in the context of a DOM element
 * This is used to resolve CSS variables to their computed values, in the context of a DOM element.
 *
 * @param parentElement - The parent element to resolve the property in the context of
 * @param propertyName - The CSS property name (e.g., 'color', 'font-weight', 'font-size')
 * @param propertyValue - The property value to resolve (can be a CSS variable)
 * @returns The resolved property value as a string
 */
export function resolveComputedCSSProperty(
  parentElement: HTMLElement,
  propertyName: string,
  propertyValue: string,
): string {
  const element = document.createElement('div');
  element.style.setProperty(propertyName, propertyValue);
  parentElement.appendChild(element);
  const computedStyle = window.getComputedStyle(element);
  const computedValue = computedStyle.getPropertyValue(propertyName);
  parentElement.removeChild(element);
  return computedValue.trim();
}

/**
 * Resolves a color to its computed value, in the context of a DOM element
 * This is used to resolve CSS variables to their computed values, in the context of a DOM element to support passing
 * CSS variables to Stripe Elements.
 *
 * @param parentElement - The parent element to resolve the color in the context of
 * @param color - The color to resolve
 * @param backgroundColor - The background color to use for the canvas, this is used to ensure colors that
 * contain an alpha value mix together correctly. So the output matches the alpha usage in the CSS.
 * @returns The resolved color as a hex string
 */
export function resolveComputedCSSColor(parentElement: HTMLElement, color: string, backgroundColor: string = 'white') {
  const computedColor = resolveComputedCSSProperty(parentElement, 'color', color);
  const computedBackgroundColor = resolveComputedCSSProperty(parentElement, 'color', backgroundColor);

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return computedColor;
  }

  ctx.fillStyle = computedBackgroundColor;
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = computedColor;
  ctx.fillRect(0, 0, 1, 1);
  const { data } = ctx.getImageData(0, 0, 1, 1);
  return `#${data[0].toString(16).padStart(2, '0')}${data[1].toString(16).padStart(2, '0')}${data[2].toString(16).padStart(2, '0')}`;
}

/**
 * Creates a CSS variable prefixed with `clerk-` with a default value
 * @param name - The name of the CSS variable
 * @param defaultValue - The default value
 * @returns The CSS variable string
 */
export const clerkCssVar = (name: string, defaultValue: string) => `var(--clerk-${name}, ${defaultValue})`;
