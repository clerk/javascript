/**
 * Check if the frontendApi ends with a staging domain
 */
export function isStaging(frontendApi: string): boolean {
  return (
    frontendApi.endsWith('.lclstage.dev') ||
    frontendApi.endsWith('.stgstage.dev') ||
    frontendApi.endsWith('.clerkstage.dev') ||
    frontendApi.endsWith('.accountsstage.dev')
  );
}
