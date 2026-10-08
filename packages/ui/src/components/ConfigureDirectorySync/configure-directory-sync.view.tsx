import type React from 'react';

import { Flow } from '@/customizables';
import { ProfileCard } from '@/elements/ProfileCard';
import { Route, Switch } from '@/router';

import { ConfigureSSOProtect } from '../ConfigureSSO/ConfigureSSO';
import { ConfigureDirectorySyncWizard } from './ConfigureDirectorySyncWizard';
import { DirectorySyncNavbar } from './DirectorySyncNavbar';

export const ConfigureDirectorySyncView = ({ authenticatedContent }: { authenticatedContent: React.ReactNode }) => (
  <Flow.Root flow='configureDirectorySync'>
    <Switch>
      <Route>{authenticatedContent}</Route>
    </Switch>
  </Flow.Root>
);

export const AuthenticatedDirectorySyncView = ({ contentRef }: { contentRef: React.RefObject<HTMLDivElement> }) => (
  <ProfileCard.Root
    sx={t => ({ display: 'grid', gridTemplateColumns: '1fr 3fr', height: t.sizes.$176, overflow: 'hidden' })}
  >
    <DirectorySyncNavbar contentRef={contentRef}>
      <ConfigureSSOProtect>
        <ConfigureDirectorySyncWizard />
      </ConfigureSSOProtect>
    </DirectorySyncNavbar>
  </ProfileCard.Root>
);
