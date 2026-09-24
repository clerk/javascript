import { DUMMY_CLERK_CLIENT_RESOURCE } from './client-resource';
import { DUMMY_CLERK_ENVIRONMENT_RESOURCE } from './environment-resource';

export { DUMMY_CLERK_CLIENT_RESOURCE, DUMMY_CLERK_ENVIRONMENT_RESOURCE };

export function isDummyClient(client: { id?: string | null } | null | undefined): boolean {
  return client?.id === DUMMY_CLERK_CLIENT_RESOURCE.id;
}

// The dummy environment's own id is empty, so its display_config id is the reliable marker.
export function isDummyEnvironment(
  environment: { display_config?: { id?: string } | null; displayConfig?: { id?: string } | null } | null | undefined,
): boolean {
  const id = environment?.display_config?.id ?? environment?.displayConfig?.id;
  return id === DUMMY_CLERK_ENVIRONMENT_RESOURCE.display_config.id;
}
