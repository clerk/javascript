import type { ClerkAPIError, OAuthStrategy, SignInResource, SignInSecondFactor } from '@clerk/shared/types';

import type { Clerk } from '../../clerk';

type ToolResult = Record<string, unknown>;

type WebMcpTool = {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute: (input: Record<string, unknown>) => Promise<ToolResult>;
};

type ModelContext = {
  registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => Promise<void> | void;
};

type SavedPassword = Credential & { password?: string };

const SECOND_FACTOR_PRIORITY = ['totp', 'phone_code', 'email_code', 'backup_code'];

const getModelContext = (): ModelContext | undefined =>
  (document as Document & { modelContext?: ModelContext }).modelContext ??
  (navigator as Navigator & { modelContext?: ModelContext }).modelContext;

const toError = (error: unknown): ToolResult => {
  const [first] = (error as { errors?: ClerkAPIError[] } | undefined)?.errors ?? [];
  if (first) {
    return { status: 'error', code: first.code, message: first.longMessage || first.message };
  }
  return { status: 'error', message: error instanceof Error ? error.message : String(error) };
};

const defineTool = (tool: WebMcpTool): WebMcpTool => ({
  ...tool,
  execute: input => tool.execute(input ?? {}).catch(toError),
});

const getAppName = (clerk: Clerk) => clerk.__internal_environment?.displayConfig.applicationName || 'this app';

const getSignInCallbackUrl = (clerk: Clerk, hash: string) => {
  const signInUrl = clerk.__internal_getOption('signInUrl') || clerk.__internal_environment?.displayConfig.signInUrl;
  const url = new URL(signInUrl || '', window.location.href);
  url.hash = hash;
  return url.href;
};

const getSignInMethods = (clerk: Clerk): string[] => {
  const userSettings = clerk.__internal_environment?.userSettings;
  if (!userSettings) {
    return [];
  }

  const { attributes } = userSettings;
  const firstFactors = [
    ...(attributes.email_address?.used_for_first_factor ? attributes.email_address.first_factors : []),
    ...(attributes.phone_number?.used_for_first_factor ? attributes.phone_number.first_factors : []),
  ];

  return [
    ...(attributes.passkey?.enabled ? ['passkey'] : []),
    ...userSettings.authenticatableSocialStrategies,
    ...(userSettings.enterpriseSSO?.enabled ? ['enterprise_sso'] : []),
    ...firstFactors.filter(strategy => ['email_code', 'email_link', 'phone_code'].includes(strategy)),
    ...(userSettings.instanceIsPasswordBased ? ['password'] : []),
  ];
};

const getAuthState = (clerk: Clerk): ToolResult => {
  const { session, user, organization } = clerk;
  if (!session || !user) {
    return { signedIn: false, signInMethods: getSignInMethods(clerk) };
  }

  return {
    signedIn: true,
    user: { id: user.id, name: user.fullName, email: user.primaryEmailAddress?.emailAddress ?? null },
    activeOrganizationId: organization?.id ?? null,
    organizations: user.organizationMemberships.map(membership => ({
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      role: membership.role,
    })),
    pendingTask: session.currentTask?.key ?? null,
  };
};

const getSecondFactor = (signIn: SignInResource): SignInSecondFactor | undefined => {
  const factors = signIn.supportedSecondFactors ?? [];
  return SECOND_FACTOR_PRIORITY.map(strategy => factors.find(factor => factor.strategy === strategy)).find(Boolean);
};

const continueSignIn = async (clerk: Clerk, signIn: SignInResource): Promise<ToolResult> => {
  if (signIn.status === 'complete') {
    await clerk.setActive({ session: signIn.createdSessionId });
    const task = clerk.session?.currentTask?.key;
    return task ? { status: 'session_task', task } : { status: 'signed_in' };
  }

  if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
    const factor = getSecondFactor(signIn);
    if (factor?.strategy === 'phone_code' || factor?.strategy === 'email_code') {
      await signIn.prepareSecondFactor(factor);
      return { status: 'needs_code', sentTo: factor.safeIdentifier, next: 'clerk_submit_code' };
    }
    if (factor) {
      return {
        status: 'needs_code',
        codeFrom: factor.strategy === 'totp' ? 'authenticator_app' : 'backup_codes',
        next: 'clerk_submit_code',
      };
    }
  }

  return {
    status: 'needs_user_action',
    message: 'Finish signing in with the sign-in form on the page.',
    signInStatus: signIn.status,
  };
};

const signInWithSavedPassword = async (clerk: Clerk, signIn: SignInResource): Promise<ToolResult> => {
  const credential = (await navigator.credentials
    ?.get({ password: true, mediation: 'required' } as CredentialRequestOptions)
    .catch(() => null)) as SavedPassword | null | undefined;

  if (!credential?.password) {
    return {
      status: 'needs_user_action',
      message: 'No saved password was chosen. The person needs to type their password into the sign-in form.',
    };
  }

  return continueSignIn(
    clerk,
    await signIn.create({ strategy: 'password', identifier: credential.id, password: credential.password }),
  );
};

const signInWithIdentifier = async (
  clerk: Clerk,
  signIn: SignInResource,
  method: string,
  identifier: string,
): Promise<ToolResult> => {
  const created = await signIn.create({ identifier });
  const factor = created.supportedFirstFactors?.find(supported => supported.strategy === method);

  if (factor?.strategy === 'email_link') {
    const { startEmailLinkFlow } = created.createEmailLinkFlow();
    void startEmailLinkFlow({
      emailAddressId: factor.emailAddressId,
      redirectUrl: getSignInCallbackUrl(clerk, '/verify'),
    })
      .then(result => (result.status === 'complete' ? clerk.setActive({ session: result.createdSessionId }) : null))
      .catch(() => null);
    return {
      status: 'needs_user_action',
      message: `Open the sign-in link sent to ${factor.safeIdentifier} in this browser, then call clerk_get_auth_state.`,
    };
  }

  if (factor?.strategy === 'email_code' || factor?.strategy === 'phone_code') {
    await created.prepareFirstFactor(factor);
    return { status: 'needs_code', sentTo: factor.safeIdentifier, next: 'clerk_submit_code' };
  }

  return { status: 'error', message: `This account can't sign in with ${method}.` };
};

const getAuthStateTool = (clerk: Clerk) =>
  defineTool({
    name: 'clerk_get_auth_state',
    description: `Returns whether the person is signed in to ${getAppName(clerk)}. When signed out, lists the sign-in methods this app accepts. When signed in, returns the user, their organizations and any pending session task.`,
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: () => Promise.resolve(getAuthState(clerk)),
  });

const getSignInTool = (clerk: Clerk) => {
  const methods = getSignInMethods(clerk);
  return defineTool({
    name: 'clerk_sign_in',
    description: `Starts signing in to ${getAppName(clerk)}. Never takes a password: "password" opens the browser's saved-password picker, "passkey" opens the browser's passkey prompt, and "oauth_*" or "enterprise_sso" redirect to the provider. Returns a status: signed_in, needs_code, needs_user_action, redirecting, session_task or error.`,
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', enum: methods },
        identifier: {
          type: 'string',
          description:
            'Email address, phone number or username. Required for email_code, email_link, phone_code and enterprise_sso.',
        },
      },
      required: ['method'],
    },
    execute: async ({ method, identifier }) => {
      const signIn = clerk.client?.signIn;
      if (!signIn || typeof method !== 'string' || !methods.includes(method)) {
        return { status: 'error', message: `Use one of: ${methods.join(', ')}.` };
      }

      if (method === 'passkey') {
        return continueSignIn(clerk, await signIn.authenticateWithPasskey({ flow: 'discoverable' }));
      }

      if (method === 'password') {
        return signInWithSavedPassword(clerk, signIn);
      }

      if (method.startsWith('oauth_') || method === 'enterprise_sso') {
        await signIn.authenticateWithRedirect({
          strategy: method as OAuthStrategy | 'enterprise_sso',
          identifier: typeof identifier === 'string' ? identifier : undefined,
          redirectUrl: getSignInCallbackUrl(clerk, '/sso-callback'),
          redirectUrlComplete: window.location.href,
        });
        return { status: 'redirecting', next: 'clerk_get_auth_state' };
      }

      if (typeof identifier !== 'string' || !identifier) {
        return { status: 'error', message: `${method} needs an identifier.` };
      }

      return signInWithIdentifier(clerk, signIn, method, identifier);
    },
  });
};

const getSubmitCodeTool = (clerk: Clerk) =>
  defineTool({
    name: 'clerk_submit_code',
    description:
      'Submits a verification code for the sign-in in progress: an email or SMS code, an authenticator app code, or a backup code. The code only works for the sign-in started in this browser.',
    inputSchema: {
      type: 'object',
      properties: { code: { type: 'string' } },
      required: ['code'],
    },
    execute: async ({ code }) => {
      const signIn = clerk.client?.signIn;
      if (!signIn || typeof code !== 'string') {
        return { status: 'error', message: 'Pass the code as a string.' };
      }

      if (signIn.status === 'needs_first_factor') {
        const strategy = signIn.firstFactorVerification.strategy;
        if (strategy === 'email_code' || strategy === 'phone_code') {
          return continueSignIn(clerk, await signIn.attemptFirstFactor({ strategy, code }));
        }
      }

      if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
        const strategy = signIn.secondFactorVerification.strategy ?? getSecondFactor(signIn)?.strategy;
        if (
          strategy === 'totp' ||
          strategy === 'phone_code' ||
          strategy === 'email_code' ||
          strategy === 'backup_code'
        ) {
          return continueSignIn(clerk, await signIn.attemptSecondFactor({ strategy, code }));
        }
      }

      return { status: 'error', message: 'No sign-in is waiting for a code. Call clerk_sign_in first.' };
    },
  });

const getSwitchOrganizationTool = (clerk: Clerk) =>
  defineTool({
    name: 'clerk_switch_organization',
    description:
      "Makes one of the user's organizations active. Pass an organization id or slug from clerk_get_auth_state.",
    inputSchema: {
      type: 'object',
      properties: { organization: { type: 'string' } },
      required: ['organization'],
    },
    execute: async ({ organization }) => {
      const membership = clerk.user?.organizationMemberships.find(
        ({ organization: org }) => org.id === organization || org.slug === organization,
      );
      if (!membership) {
        return { status: 'error', message: 'The user is not a member of that organization.' };
      }

      await clerk.setActive({ organization: membership.organization.id });
      return getAuthState(clerk);
    },
  });

const getSignOutTool = (clerk: Clerk) =>
  defineTool({
    name: 'clerk_sign_out',
    description: `Signs the person out of ${getAppName(clerk)}.`,
    execute: async () => {
      await clerk.signOut();
      return { status: 'signed_out' };
    },
  });

export const registerWebMcpTools = (clerk: Clerk): void => {
  const modelContext = getModelContext();
  if (!modelContext) {
    return;
  }

  const register = (tools: WebMcpTool[], signal?: AbortSignal) => {
    tools.forEach(tool => {
      void Promise.resolve()
        .then(() => modelContext.registerTool(tool, { signal }))
        .catch(() => null);
    });
  };

  register([getAuthStateTool(clerk)]);

  let signedIn: boolean | undefined;
  let controller: AbortController | undefined;
  clerk.addListener(({ session }) => {
    if (signedIn === Boolean(session)) {
      return;
    }

    signedIn = Boolean(session);
    controller?.abort();
    controller = new AbortController();

    const organizationsEnabled = clerk.__internal_environment?.organizationSettings.enabled;
    register(
      signedIn
        ? [...(organizationsEnabled ? [getSwitchOrganizationTool(clerk)] : []), getSignOutTool(clerk)]
        : [getSignInTool(clerk), getSubmitCodeTool(clerk)],
      controller.signal,
    );
  });
};
