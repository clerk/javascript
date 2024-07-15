import { customAlphabet, urlAlphabet } from 'nanoid';

/**
 * Generates a safe, URL-friendly unique identifier.
 *
 * @example
 * const id = generateSafeId();
 * console.log(id); // Outputs something like: "f3x2P9Xn1K"
 */
export const generateSafeId = (defaultSize = 10) => customAlphabet(urlAlphabet, defaultSize)();
