import { useEffect, useState } from 'react';

import { fill } from '../../localization';
import type { ConsentMessages, ConsentReadyModel, ConsentViewProps } from './consent.types';

const PRIVATE_METADATA_SCOPE = 'private_metadata';

export function useConsentController(
  { status: _status, scopes, defaultOrganizationId, ...model }: ConsentReadyModel,
  messages: ConsentMessages,
): ConsentViewProps {
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [isRedirectUrlOpen, setIsRedirectUrlOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'allow' | 'deny'>();

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setPendingAction(undefined);
      }
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  return {
    ...model,
    messages,
    scopes: scopes.map(({ scope, description }) => ({
      scope,
      label:
        scope === PRIVATE_METADATA_SCOPE
          ? fill(messages.privateMetadata, { applicationName: model.applicationName })
          : description || scope,
    })),
    organizationId: selectedOrganizationId ?? defaultOrganizationId,
    onOrganizationChange: setSelectedOrganizationId,
    isRedirectUrlOpen,
    onRedirectUrlOpenChange: setIsRedirectUrlOpen,
    pendingAction,
    onAllow: () => setPendingAction('allow'),
    onDeny: () => setPendingAction('deny'),
  };
}
