import type {
  AuthenticateWithNativeRedirectParams,
  HandleOAuthCallbackParams,
  HandleSamlCallbackParams,
  LoadedClerk,
  SignInResource,
  SignUpResource,
} from '@clerk/shared/types';

type Navigate = (to: string) => Promise<unknown>;

type CallbackParams = HandleOAuthCallbackParams | HandleSamlCallbackParams;

type SignUpNativeRedirectParams = Parameters<SignUpResource['__experimental_authenticateWithNativeRedirect']>[0];

export function authenticateWithNativeRedirect(opts: {
  clerk: LoadedClerk;
  resource: SignInResource;
  params: AuthenticateWithNativeRedirectParams;
  callbackParams: CallbackParams;
  navigate: Navigate;
}): Promise<unknown>;

export function authenticateWithNativeRedirect(opts: {
  clerk: LoadedClerk;
  resource: SignUpResource;
  params: SignUpNativeRedirectParams;
  callbackParams: CallbackParams;
  navigate: Navigate;
}): Promise<unknown>;

export async function authenticateWithNativeRedirect(opts: {
  clerk: LoadedClerk;
  resource: SignInResource | SignUpResource;
  params: AuthenticateWithNativeRedirectParams | SignUpNativeRedirectParams;
  callbackParams: CallbackParams;
  navigate: Navigate;
}): Promise<unknown> {
  const resource =
    'missingFields' in opts.resource
      ? await opts.resource.__experimental_authenticateWithNativeRedirect(opts.params as SignUpNativeRedirectParams)
      : await opts.resource.__experimental_authenticateWithNativeRedirect(
          opts.params as AuthenticateWithNativeRedirectParams,
        );

  return opts.clerk.__experimental_handleNativeRedirectCallback(resource, opts.callbackParams, opts.navigate);
}
