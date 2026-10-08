import React from 'react';

import type { useSignInEmailLinkModel } from './sign-in-email-link.model';

type SignInEmailLinkModel = ReturnType<typeof useSignInEmailLinkModel>;

export function useSignInEmailLinkController(model: SignInEmailLinkModel) {
  const [status, setStatus] = React.useState<'verified_switch_tab' | null>(null);

  React.useEffect(() => {
    void model.start().then(setStatus);
  }, []);

  const restartVerification = () => {
    model.cancel();
    void model.start().then(setStatus);
  };

  return {
    status,
    restartVerification,
  };
}
