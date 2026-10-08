import type { ConfigureSSOProps } from '@clerk/shared/types';
import type React from 'react';
import { useRef } from 'react';

import { withCoreUserGuard } from '@/contexts';
import { withCardStateProvider } from '@/elements/contexts';

import { AuthenticatedDirectorySyncView, ConfigureDirectorySyncView } from './configure-directory-sync.view';

/**
 * Standalone host for the Directory Sync onboarding wizard, mirroring
 * ConfigureSSO's shell.
 */
const ConfigureDirectorySyncInternal = (): JSX.Element => {
  return <ConfigureDirectorySyncView authenticatedContent={<AuthenticatedContent />} />;
};

const AuthenticatedContent = withCoreUserGuard(() => {
  const contentRef = useRef<HTMLDivElement>(null);
  return <AuthenticatedDirectorySyncView contentRef={contentRef} />;
});

export const ConfigureDirectorySync: React.ComponentType<ConfigureSSOProps> =
  withCardStateProvider(ConfigureDirectorySyncInternal);
