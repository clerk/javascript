export function isDevelopmentFromApiKey(apiKey: string): boolean {
  return apiKey.startsWith('test_');
}

export function isProductionFromApiKey(apiKey: string): boolean {
  return apiKey.startsWith('live_');
}
