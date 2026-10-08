import type { __internal_EnableOrganizationsPromptProps } from '@clerk/shared/types';
import { useId, useRef, useState } from 'react';

import type { useEnableOrganizationsPromptModel } from './enable-organizations-prompt.model';

export const useEnableOrganizationsPromptController = (
  model: ReturnType<typeof useEnableOrganizationsPromptModel>,
  { caller, onSuccess, onClose }: __internal_EnableOrganizationsPromptProps,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [defaultOrganizationName, setDefaultOrganizationName] = useState<string | null>(null);
  const [allowPersonalAccount, setAllowPersonalAccount] = useState(false);
  const initialFocusRef = useRef<HTMLHeadingElement>(null);
  const radioGroupLabelId = useId();

  const handleEnableOrganizations = () => {
    setIsLoading(true);
    void model
      .enableOrganizations(allowPersonalAccount)
      .then(name => {
        setDefaultOrganizationName(name);
        setIsEnabled(true);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  const handleClaimClick = (anchor: HTMLAnchorElement) => {
    if (model.claimUrl) {
      const url = new URL(model.claimUrl);
      url.searchParams.append('return_url', window.location.href);
      anchor.href = url.href;
    }
    model.closePrompt();
  };

  const handleContinue = () => {
    if (!model.hasUser) {
      void model.redirectToSignIn();
      model.closePrompt();
    } else {
      onSuccess?.();
    }
  };

  const handleClose = () => {
    model.closePrompt();
    onClose?.();
  };

  return {
    caller,
    onSuccess,
    ...model,
    isLoading,
    isEnabled,
    defaultOrganizationName,
    allowPersonalAccount,
    setAllowPersonalAccount,
    initialFocusRef,
    radioGroupLabelId,
    showKeylessClaimPath: isEnabled && model.isKeyless && !model.isClaimed,
    isComponent: !caller.startsWith('use'),
    handleEnableOrganizations,
    handleClaimClick,
    handleContinue,
    handleClose,
  };
};
