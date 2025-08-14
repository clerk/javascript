/**
 * Generates a RFC 4122 v4 UUID using the best available source of randomness.
 *
 * Order of preference:
 * - crypto.randomUUID (when available)
 * - crypto.getRandomValues with manual v4 formatting
 * - Math.random-based fallback (not cryptographically secure; last resort)
 */
export function generateUuid(): string {
  const cryptoApi = (globalThis as unknown as { crypto?: Crypto }).crypto;

  if (cryptoApi && typeof (cryptoApi as any).randomUUID === 'function') {
    return (cryptoApi as any).randomUUID();
  }

  if (cryptoApi && typeof cryptoApi.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);

    // Per RFC 4122 §4.4
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10

    const hex: string[] = [];
    for (let i = 0; i < bytes.length; i++) {
      hex.push((bytes[i] + 0x100).toString(16).substring(1));
    }

    return (
      hex[0] +
      hex[1] +
      hex[2] +
      hex[3] +
      '-' +
      hex[4] +
      hex[5] +
      '-' +
      hex[6] +
      hex[7] +
      '-' +
      hex[8] +
      hex[9] +
      '-' +
      hex[10] +
      hex[11] +
      hex[12] +
      hex[13] +
      hex[14] +
      hex[15]
    );
  }

  // Last-resort fallback for very old environments (not cryptographically secure)
  // Format: 8-4-4-4-12, with version=4 and variant=8|9|a|b
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
