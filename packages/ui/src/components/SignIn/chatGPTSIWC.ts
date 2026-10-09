const hasChatGPTSIWCContinuation = (queryParams: Record<string, string | undefined>): boolean => {
  if (queryParams.target_flow !== 'chatgpt_siwc' || !queryParams.redirect_url) {
    return false;
  }

  try {
    const continuation = new URL(queryParams.redirect_url);
    // An authorization that has already been validated and stored by FAPI can
    // hand off directly to consent. Account mismatch is discovered after that
    // handoff, so the hosted sign-in redirect points at `/oauth-consent` while
    // the original `/oauth/authorize/continue` request remains server-side.
    if (
      !continuation.pathname.endsWith('/oauth/authorize/continue') &&
      !continuation.pathname.endsWith('/oauth-consent')
    ) {
      return false;
    }
    const params = continuation.searchParams;
    return (
      params.get('target_flow') === 'chatgpt_siwc' &&
      Boolean(params.get('client_id')) &&
      Boolean(params.get('state')) &&
      Boolean(params.get('redirect_uri')) &&
      Boolean(params.get('code_challenge')) &&
      params.get('code_challenge_method') === 'S256'
    );
  } catch {
    return false;
  }
};

export const isChatGPTSIWCFlow = hasChatGPTSIWCContinuation;

export const isChatGPTSIWCAccountMismatch = (queryParams: Record<string, string | undefined>): boolean =>
  isChatGPTSIWCFlow(queryParams) && queryParams.__clerk_siwc_account_mismatch === 'true';

export const isChatGPTSIWCAccountChoicePending = (queryParams: Record<string, string | undefined>): boolean =>
  isChatGPTSIWCFlow(queryParams) && queryParams.__clerk_siwc_account_choice_pending === 'true';

export const chatGPTSIWCOIDCPrompt = (
  existingPrompt: string | undefined,
  queryParams: Record<string, string | undefined>,
): string | undefined => {
  const prompts = new Set((existingPrompt || '').split(/\s+/).filter(Boolean));
  if (!hasChatGPTSIWCContinuation(queryParams)) {
    return prompts.size ? Array.from(prompts).join(' ') : undefined;
  }
  if (queryParams.__clerk_siwc_prompt_login === 'true') {
    prompts.add('login');
  }
  if (queryParams.__clerk_siwc_prompt_select_account === 'true') {
    prompts.add('select_account');
  }
  return prompts.size ? Array.from(prompts).join(' ') : undefined;
};
