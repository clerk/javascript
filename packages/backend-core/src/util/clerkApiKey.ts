export function isDevelopmentOrStaging(apiKey: string): boolean {
  return apiKey.startsWith('test_') || apiKey.startsWith('sk_test_');
}

export function isProduction(apiKey: string): boolean {
  return !isDevelopmentOrStaging(apiKey);
}
