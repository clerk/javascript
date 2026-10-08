export const PLATFORM_CREDENTIAL_VARIABLES: readonly string[];
export const AGENT_CREDENTIAL_VARIABLES: readonly string[];
export function supportsNode(version: string): boolean;
export function ensureRuntime(): Promise<void>;
