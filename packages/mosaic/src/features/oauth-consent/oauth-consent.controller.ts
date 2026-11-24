import { useEffect, useState } from 'react';

import { fill } from '../../localization';
import type { OAuthConsentMessages, OAuthConsentReadyModel, OAuthConsentViewProps } from './oauth-consent.types';
import { MAX_CONSENTED_ORGANIZATIONS, OFFLINE_ACCESS_SCOPE, USER_ORG_READ_SCOPE } from './oauth-consent.utils';

const PRIVATE_METADATA_SCOPE = 'private_metadata';

export function useOAuthConsentController(
  { status: _status, scopes, organizations, defaultOrganizationId, ...model }: OAuthConsentReadyModel,
  messages: OAuthConsentMessages,
): OAuthConsentViewProps {
  const [uncheckedScopes, setUncheckedScopes] = useState<readonly string[]>([]);
  const [selectedOrganizationIds, setSelectedOrganizationIds] = useState<string[] | null>(null);
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

  const checked = scopes
    .map(item => item.scope)
    .filter(scope => scope === OFFLINE_ACCESS_SCOPE || !uncheckedScopes.includes(scope));
  const sharesOrganizations = checked.includes(USER_ORG_READ_SCOPE);

  return {
    ...model,
    messages,
    scopes: scopes.map(({ scope, description }) => ({
      scope,
      label:
        scope === PRIVATE_METADATA_SCOPE
          ? fill(messages.privateMetadata, { applicationName: model.applicationName })
          : description || scope,
      required: scope === OFFLINE_ACCESS_SCOPE,
    })),
    scopeSelection: {
      checked,
      onCheckedChange: (scope, isChecked) =>
        setUncheckedScopes(current => (isChecked ? current.filter(item => item !== scope) : [...current, scope])),
    },
    scope: checked.join(' ') || OFFLINE_ACCESS_SCOPE,
    organizations: sharesOrganizations ? organizations : [],
    organizationSelection: {
      multiple: true,
      organizationIds: sharesOrganizations
        ? (selectedOrganizationIds ?? (defaultOrganizationId === null ? [] : [defaultOrganizationId]))
        : [],
      onOrganizationIdsChange: setSelectedOrganizationIds,
      limit: MAX_CONSENTED_ORGANIZATIONS,
    },
    isRedirectUrlOpen,
    onRedirectUrlOpenChange: setIsRedirectUrlOpen,
    pendingAction,
    onAllow: () => setPendingAction('allow'),
    onDeny: () => setPendingAction('deny'),
  };
}
