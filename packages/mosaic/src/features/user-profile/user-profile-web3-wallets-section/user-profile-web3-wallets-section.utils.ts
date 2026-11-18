export function normalizedWeb3Wallet(identifier: string): string {
  const trimmed = identifier.trim();
  return /^0x/i.test(trimmed) ? trimmed.toLowerCase() : trimmed;
}
