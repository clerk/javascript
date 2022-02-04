import {
  SignInProps,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
} from '@clerk/types';
import React from 'react';
import { buildAuthQueryString, parseAuthProp } from 'ui/common';
import { useEnvironment } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import type { ParsedQs } from 'ui/router';
import { useRouter } from 'ui/router';

export type SignInCtx = SignInProps & {
  componentName: 'SignIn';
};

export type UserProfileCtx = UserProfileProps & {
  componentName: 'UserProfile';
};

export type SignUpCtx = SignUpProps & {
  componentName: 'SignUp';
};

export type UserButtonCtx = UserButtonProps & {
  componentName: 'UserButton';
};

export type ComponentContextValue =
  | SignInCtx
  | UserProfileCtx
  | SignUpCtx
  | UserButtonCtx;

export const ComponentContext = React.createContext<ComponentContextValue | null>(
  null,
);

export type SignUpContextType = SignUpProps & {
  navigateAfterSignUp: () => any;
  queryParams: ParsedQs;
  signInUrl: string;
  authQueryString: string | null;
};
export const useSignUpContext = (): SignUpContextType => {
  const { componentName, ...ctx } = React.useContext(
    ComponentContext,
  ) as SignUpCtx;
  const { navigate } = useNavigate();
  const { displayConfig } = useEnvironment();
  const { queryParams } = useRouter();

  if (componentName !== 'SignUp') {
    throw new Error(
      'Clerk: useSignUpContext called outside of the mounted SignUp component.',
    );
  }

  // Retrieve values passed through props or qs
  // props always take priority over qs
  const afterSignUpUrl = parseAuthProp({
    ctx,
    queryParams,
    displayConfig,
    field: 'afterSignUpUrl',
  });

  const afterSignInUrl = parseAuthProp({
    ctx,
    queryParams,
    displayConfig,
    field: 'afterSignInUrl',
  });

  const navigateAfterSignUp = () => navigate(afterSignUpUrl);

  // DX: deprecated <=1.28.0
  // Todo: remove ctx.afterSignIn
  let signInUrl = ctx.signInUrl || ctx.signInURL || displayConfig.signInUrl;

  // Add query strings to the sign in URL
  const authQs = buildAuthQueryString({
    afterSignInUrl: afterSignInUrl,
    afterSignUpUrl: afterSignUpUrl,
    displayConfig: displayConfig,
  });

  // Todo: Look for a better way than checking virtual
  if (authQs && ctx.routing != 'virtual') {
    signInUrl += `#/?${authQs}`;
  }

  return {
    ...ctx,
    signInUrl,
    afterSignUpUrl,
    afterSignInUrl,
    navigateAfterSignUp,
    queryParams,
    authQueryString: authQs,
  };
};

export type SignInContextType = SignInProps & {
  navigateAfterSignIn: () => any;
  queryParams: ParsedQs;
  signUpUrl: string;
  authQueryString: string | null;
};
export const useSignInContext = (): SignInContextType => {
  const { componentName, ...ctx } = React.useContext(
    ComponentContext,
  ) as SignInCtx;
  const { navigate } = useNavigate();
  const { displayConfig } = useEnvironment();
  const { queryParams } = useRouter();

  if (componentName !== 'SignIn') {
    throw new Error(
      'Clerk: useSignInContext called outside of the mounted SignIn component.',
    );
  }

  // Retrieve values passed through props or qs
  // props always take priority over qs
  const afterSignUpUrl = parseAuthProp({
    ctx,
    queryParams,
    displayConfig,
    field: 'afterSignUpUrl',
  });

  const afterSignInUrl = parseAuthProp({
    ctx,
    queryParams,
    displayConfig,
    field: 'afterSignInUrl',
  });

  const navigateAfterSignIn = () => navigate(afterSignInUrl);

  // DX: deprecated <=1.28.0
  // Todo: remove ctx.signUpURL
  let signUpUrl = ctx.signUpUrl || ctx.signUpURL || displayConfig.signUpUrl;

  // Add query strings to the sign in URL
  const authQs = buildAuthQueryString({
    afterSignInUrl: afterSignInUrl,
    afterSignUpUrl: afterSignUpUrl,
    displayConfig: displayConfig,
  });
  if (authQs && ctx.routing !== 'virtual') {
    signUpUrl += `#/?${authQs}`;
  }

  return {
    ...ctx,
    signUpUrl,
    afterSignInUrl,
    afterSignUpUrl,
    navigateAfterSignIn,
    queryParams,
    authQueryString: authQs,
  };
};

export type UserProfileContextType = UserProfileProps & {
  queryParams: ParsedQs;
  authQueryString: string | null;
};

// UserProfile does not accept any props except for
// `routing` and `path`
// TODO: remove if not needed during the components v2 overhaul
export const useUserProfileContext = (): UserProfileContextType => {
  const { componentName, ...ctx } = React.useContext(
    ComponentContext,
  ) as UserProfileCtx;
  const { queryParams } = useRouter();

  if (componentName !== 'UserProfile') {
    throw new Error(
      'Clerk: useUserProfileContext called outside of the mounted UserProfile component.',
    );
  }

  return {
    ...ctx,
    queryParams,
    authQueryString: '',
  };
};

export const useUserButtonContext = () => {
  const { componentName, ...ctx } = React.useContext(
    ComponentContext,
  ) as UserButtonCtx;
  const { navigate } = useNavigate();
  const { displayConfig } = useEnvironment();

  if (componentName !== 'UserButton') {
    throw new Error(
      'Clerk: useUserButtonContext called outside of the mounted UserButton component.',
    );
  }

  // DX: deprecated <=1.28.0
  // Todo: remove deprecated props
  const signInUrl = ctx.signInUrl || ctx.signInURL || displayConfig.signInUrl;
  const userProfileUrl =
    ctx.userProfileUrl || ctx.userProfileURL || displayConfig.userProfileUrl;

  const afterSignOutOneUrl =
    ctx.afterSignOutOneUrl ||
    ctx.afterSignOutOne ||
    displayConfig.afterSignOutOneUrl;
  const navigateAfterSignOutOne = () => navigate(afterSignOutOneUrl);

  const afterSignOutAllUrl =
    ctx.afterSignOutAllUrl ||
    ctx.afterSignOutAll ||
    displayConfig.afterSignOutAllUrl;
  const navigateAfterSignOutAll = () => navigate(afterSignOutAllUrl);

  const afterSwitchSessionUrl = (ctx.afterSwitchSessionUrl =
    ctx.afterSwitchSession || displayConfig.afterSwitchSessionUrl);
  const navigateAfterSwitchSession = () => navigate(afterSwitchSessionUrl);

  return {
    ...ctx,
    navigateAfterSignOutOne,
    navigateAfterSignOutAll,
    navigateAfterSwitchSession,
    signInUrl,
    userProfileUrl,
    afterSignOutOneUrl,
    afterSignOutAllUrl,
    afterSwitchSessionUrl,
  };
};
