import React from 'react';

import { buildCombinedFlowOAuthCallbackParams, buildSignInOAuthCallbackParams } from './buildOAuthCallbackParams';
import type { useRedirectToSignInModel, useSignInRoutesModel } from './sign-in-routes.model';

export const useSignInRoutesController = (model: ReturnType<typeof useSignInRoutesModel>) => ({
  isCombinedFlow: model.signInContext.isCombinedFlow,
  signInOAuthCallbackParams: buildSignInOAuthCallbackParams(model.signInContext),
  signUpOAuthCallbackParams: buildCombinedFlowOAuthCallbackParams(model.signUpContext),
  afterSignUpUrl: model.signUpContext.afterSignUpUrl,
  combinedFlowTasksRedirectUrl: model.signInContext.afterSignUpUrl,
  ssoCallbackUrl: model.signUpContext.ssoCallbackUrl,
  oidcPrompt: model.signUpContext.oidcPrompt,
  afterSignInUrl: model.signInContext.afterSignInUrl,
});

export const useRedirectToSignInController = (model: ReturnType<typeof useRedirectToSignInModel>) => {
  const { redirectToSignIn } = model;
  React.useEffect(() => {
    void redirectToSignIn();
  }, [redirectToSignIn]);
};
