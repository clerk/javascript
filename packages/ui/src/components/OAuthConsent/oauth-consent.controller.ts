import type { FormEventHandler } from 'react';
import { useState } from 'react';

import type { useOAuthConsentModel } from './oauth-consent.model';

export const useOAuthConsentController = (model: ReturnType<typeof useOAuthConsentModel>) => {
  const [isUriModalOpen, setIsUriModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const onSubmit: FormEventHandler<HTMLFormElement> = event => {
    if (!model.hasContextCallbacks) {
      return;
    }
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.value === 'true') {
      model.allow();
    } else {
      model.deny();
    }
  };

  return {
    status: model.status,
    errorMessage: model.errorMessage,
    actionUrl: model.actionUrl,
    hasContextCallbacks: model.hasContextCallbacks,
    forwardedParams: model.forwardedParams,
    oauthApplicationName: model.oauthApplicationName,
    oauthApplicationLogoUrl: model.oauthApplicationLogoUrl,
    oauthApplicationUrl: model.oauthApplicationUrl,
    applicationName: model.applicationName,
    hasApplicationLogo: model.hasApplicationLogo,
    redirectUrl: model.redirectUrl,
    domainAction: model.domainAction,
    viewFullUrlText: model.viewFullUrlText,
    warningText: model.warningText,
    redirectNoticeText: model.redirectNoticeText,
    offlineAccessNotice: model.offlineAccessNotice,
    primaryIdentifier: model.primaryIdentifier,
    orgOptions: model.orgOptions,
    orgSelectionEnabled: model.orgSelectionEnabled,
    displayedScopes: model.displayedScopes,
    hasOfflineAccess: model.hasOfflineAccess,
    effectiveOrg: selectedOrg ?? model.defaultOrg,
    isUriModalOpen,
    onSubmit,
    onSelectOrg: setSelectedOrg,
    onOpenUriModal: () => setIsUriModalOpen(true),
    onCloseUriModal: () => setIsUriModalOpen(false),
  };
};
