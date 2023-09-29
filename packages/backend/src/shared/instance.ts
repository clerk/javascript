export function isDevelopmentFromApiKey(apiKey: string): boolean {
  return apiKey.startsWith('test_') || apiKey.startsWith('sk_test_');
}

export function isProductionFromApiKey(apiKey: string): boolean {
  return apiKey.startsWith('live_') || apiKey.startsWith('sk_live_');
}

export function isStaging(frontendApi: string): boolean {
  return (
    frontendApi.endsWith('.lclstage.dev') ||
    frontendApi.endsWith('.stgstage.dev') ||
    frontendApi.endsWith('.clerkstage.dev') ||
    frontendApi.endsWith('.accountsstage.dev')
  );
}
