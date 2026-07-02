import {
  clerkHandlers,
  EnvironmentService,
  HttpResponse,
  http,
  SessionService,
  setClerkState,
  SignInService,
  SignUpService,
  type MockScenario,
} from '@clerk/msw';

const sdkChallengeUrl = 'https://protect.example.test/sdk-challenge.js';
const challengeTTL = 5 * 60 * 1000;
const signedInIdentifierStorageKey = 'clerk-js-sandbox-protect-challenge-signed-in-identifier';
const challengeModeSearchParam = 'protectChallengeMode';
const challengeWidgetSearchParam = 'protectChallengeWidget';

type ChallengeMode = 'auto' | 'manual';

// Cloudflare's universal Turnstile test sitekeys (valid on any domain). Used
// by the opt-in `protectChallengeWidget=turnstile` mode so the real widget
// renders inside the protect-check card for visual QA while the proof-token
// plumbing stays mocked. Loading Turnstile from Cloudflare's CDN is the only
// network dependency in this scenario, which is why it is not the default.
const turnstileAlwaysPassesSitekey = '1x00000000000000000000AA';
const turnstileForceInteractiveSitekey = '3x00000000000000000000FF';

function getStoredSignedInIdentifier() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage.getItem(signedInIdentifierStorageKey);
  } catch {
    return null;
  }
}

function storeSignedInIdentifier(identifier: string) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(signedInIdentifierStorageKey, identifier);
  } catch {
    return;
  }
}

function getChallengeMode(): ChallengeMode {
  if (typeof window === 'undefined') {
    return 'auto';
  }

  try {
    return new URLSearchParams(window.location.search).get(challengeModeSearchParam) === 'manual' ? 'manual' : 'auto';
  } catch {
    return 'auto';
  }
}

/**
 * The msw session template ships with `user: null`, so a session piggybacked
 * on a resolver response hydrates an empty `Clerk.user` after `setActive`.
 * Graft a minimal UserJSON onto it so the signed-in state carries the real
 * user the integration spec asserts on.
 */
function attachSessionUser(session: unknown, userId: string, identifier: string) {
  (session as { user: unknown }).user = {
    object: 'user',
    id: userId,
    primary_email_address_id: 'email_signed_in_user',
    email_addresses: [
      {
        object: 'email_address',
        id: 'email_signed_in_user',
        email_address: identifier,
        verification: {
          object: 'verification',
          status: 'verified',
          strategy: 'ticket',
          attempts: null,
          expire_at: null,
        },
        linked_to: [],
      },
    ],
    phone_numbers: [],
    web3_wallets: [],
    external_accounts: [],
    enterprise_accounts: [],
    passkeys: [],
    organization_memberships: [],
  };
}

function createNoStoreResponse(data: unknown, options?: { status?: number }) {
  return HttpResponse.json(data, {
    status: options?.status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    },
  });
}

async function parseUrlEncodedBody(request: Request): Promise<Record<string, string>> {
  const body: Record<string, string> = {};
  const params = new URLSearchParams(await request.text());
  params.forEach((value, key) => {
    body[key] = value;
  });
  return body;
}

function createProtectCheck(token: string) {
  return {
    status: 'pending',
    token,
    sdk_url: sdkChallengeUrl,
    expires_at: Date.now() + challengeTTL,
    ui_hints: {
      mode: getChallengeMode(),
      source: 'clerk-js-sandbox',
    },
  };
}

function createMissingProofTokenResponse() {
  return createNoStoreResponse(
    {
      errors: [
        {
          code: 'form_param_nil',
          long_message: 'Proof token is required.',
          message: 'is missing or empty',
          meta: { param_name: 'proof_token' },
        },
      ],
    },
    { status: 422 },
  );
}

async function resolveSignUpProtectCheck(request: Request) {
  const body = await parseUrlEncodedBody(request);
  if (!body.proof_token) {
    return createMissingProofTokenResponse();
  }

  const signUpResponse = SignUpService.createSignUpResponse({
    email: SignUpService.getEmail(),
    firstName: SignUpService.getFirstName(),
    lastName: SignUpService.getLastName(),
    status: 'missing_requirements',
    unverifiedFields: ['email_address'],
    verificationAttempts: 0,
    verificationStatus: 'unverified',
  });
  (signUpResponse as any).missing_fields = [];
  (signUpResponse as any).protect_check = null;

  const clientState = SessionService.getClientState(null);
  clientState.response.sign_up = signUpResponse as any;

  return createNoStoreResponse({
    client: clientState.response,
    response: signUpResponse,
  });
}

async function resolveSignInProtectCheck(request: Request, environment: typeof EnvironmentService.SINGLE_SESSION) {
  const body = await parseUrlEncodedBody(request);
  if (!body.proof_token) {
    return createMissingProofTokenResponse();
  }

  const { clientState, newSession, newUser, signInResponse } = SignInService.createUser(null);
  attachSessionUser(newSession, newUser.id, SignInService.getIdentifier());
  setClerkState({ environment, session: newSession as any, user: newUser });
  storeSignedInIdentifier(SignInService.getIdentifier());
  clientState.response.sign_in = signInResponse as any;

  return createNoStoreResponse({
    client: clientState.response,
    response: signInResponse,
  });
}

export function ProtectChallenge(): MockScenario {
  const environment = structuredClone(EnvironmentService.SINGLE_SESSION);
  environment.config.user_settings.social = {};

  const signedInIdentifier = getStoredSignedInIdentifier();

  if (signedInIdentifier) {
    SignInService.setIdentifier(signedInIdentifier);
    const { newSession, newUser } = SignInService.createUser(null);
    attachSessionUser(newSession, newUser.id, signedInIdentifier);
    setClerkState({ environment, session: newSession as any, user: newUser });
  } else {
    setClerkState({ environment, session: null });
  }

  return {
    description: 'Sign-in and sign-up pages gated by a Clerk Protect SDK challenge',
    handlers: [
      http.get(sdkChallengeUrl, () => {
        return HttpResponse.text(
          `
            export default async function runProtectChallenge(container, { token, uiHints, signal }) {
              const searchParams = new URLSearchParams(window.location.search);
              const modeFromUrl = searchParams.get('${challengeModeSearchParam}');
              const mode = uiHints?.mode === 'manual' || modeFromUrl === 'manual' ? 'manual' : 'auto';
              const widgetKind = searchParams.get('${challengeWidgetSearchParam}') === 'turnstile' ? 'turnstile' : 'box';

              if (signal?.aborted) {
                const error = new Error('Protect challenge aborted');
                error.name = 'AbortError';
                throw error;
              }

              container.dataset.protectChallengeToken = token;
              container.dataset.protectChallengeSource = uiHints?.source || '';
              container.dataset.protectChallengeMode = mode;

              const marker = document.createElement('div');
              marker.setAttribute('data-testid', 'protect-challenge-sdk');
              marker.style.cssText = [
                'display:flex',
                'flex-direction:column',
                'gap:10px',
                'margin:12px 0',
                'padding:14px',
                'border:1px solid #d8d1ff',
                'border-radius:8px',
                'background:#f7f5ff',
                'color:#27145c',
                'font:14px/1.4 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              ].join(';');

              const title = document.createElement('strong');
              title.textContent = 'Protect challenge';
              marker.appendChild(title);

              const description = document.createElement('span');
              description.textContent =
                mode === 'manual'
                  ? 'Manual sandbox mode is waiting for you to complete the challenge.'
                  : 'Sandbox challenge completed automatically.';
              marker.appendChild(description);

              container.appendChild(marker);

              if (widgetKind === 'turnstile') {
                // Render the real Turnstile widget with a Cloudflare test
                // sitekey so the card can be visually QA'd with production
                // pixels; the proof token below is still the sandbox fake.
                const sitekey = mode === 'manual' ? '${turnstileForceInteractiveSitekey}' : '${turnstileAlwaysPassesSitekey}';
                description.textContent = 'Cloudflare Turnstile via test sitekey (' + sitekey + ').';
                const slot = document.createElement('div');
                marker.appendChild(slot);

                await new Promise((resolve, reject) => {
                  let widgetId;
                  let settled = false;
                  // Settle exactly once: whichever of abort / script-error /
                  // widget callback fires first wins, and later events no-op.
                  const settle = fn => value => {
                    if (settled) return;
                    settled = true;
                    signal?.removeEventListener('abort', onAbort);
                    fn(value);
                  };
                  const succeed = settle(resolve);
                  const fail = settle(reject);
                  const onAbort = () => {
                    try { window.turnstile?.remove(widgetId); } catch {}
                    const error = new Error('Protect challenge aborted');
                    error.name = 'AbortError';
                    fail(error);
                  };
                  if (signal?.aborted) { onAbort(); return; }
                  signal?.addEventListener('abort', onAbort, { once: true });

                  const render = () => {
                    // The script may finish loading after an abort settled the
                    // run — don't render into an abandoned slot.
                    if (settled || signal?.aborted) return;
                    widgetId = window.turnstile.render(slot, {
                      sitekey,
                      callback: () => {
                        description.textContent = 'Turnstile challenge completed.';
                        succeed();
                      },
                      'error-callback': () => fail(new Error('Turnstile widget errored')),
                    });
                  };

                  if (window.turnstile) { render(); return; }
                  // Reuse an in-flight script tag from a previous run, but
                  // always attach BOTH load and error handlers (they no-op
                  // once settled).
                  let script = document.querySelector('script[data-sandbox-turnstile]');
                  if (!script) {
                    script = document.createElement('script');
                    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
                    script.async = true;
                    script.dataset.sandboxTurnstile = 'true';
                    document.head.appendChild(script);
                  }
                  script.addEventListener('load', render, { once: true });
                  script.addEventListener('error', () => fail(new Error('Failed to load the Turnstile script')), { once: true });
                });

                return 'sandbox-proof-token:' + token;
              }

              if (mode === 'manual') {
                await new Promise((resolve, reject) => {
                  const button = document.createElement('button');
                  button.type = 'button';
                  button.setAttribute('data-testid', 'protect-challenge-complete');
                  button.textContent = 'Complete challenge';
                  button.style.cssText = [
                    'align-self:flex-start',
                    'border:0',
                    'border-radius:6px',
                    'background:#6c47ff',
                    'color:#fff',
                    'cursor:pointer',
                    'font:600 13px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    'padding:9px 12px',
                  ].join(';');

                  const abort = () => {
                    button.removeEventListener('click', complete);
                    const error = new Error('Protect challenge aborted');
                    error.name = 'AbortError';
                    reject(error);
                  };

                  const complete = () => {
                    signal?.removeEventListener('abort', abort);
                    button.disabled = true;
                    button.textContent = 'Challenge complete';
                    description.textContent = 'Manual sandbox challenge completed.';
                    resolve();
                  };

                  if (signal?.aborted) {
                    abort();
                    return;
                  }

                  signal?.addEventListener('abort', abort, { once: true });
                  button.addEventListener('click', complete, { once: true });
                  marker.appendChild(button);
                });
              } else {
                await new Promise(resolve => setTimeout(resolve, 10));
              }

              return 'sandbox-proof-token:' + token;
            }
          `,
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, private',
              'Content-Type': 'text/javascript',
            },
          },
        );
      }),

      http.post('*/v1/client/sign_ups', async ({ request }) => {
        const body = await parseUrlEncodedBody(request);
        const email = body.email_address || body.emailAddress || 'user@example.com';
        const firstName = body.first_name || body.firstName || null;
        const lastName = body.last_name || body.lastName || null;

        SignUpService.setEmail(email);
        SignUpService.setFirstName(firstName);
        SignUpService.setLastName(lastName);

        const signUpResponse = SignUpService.createSignUpResponse({
          email,
          firstName,
          lastName,
          status: 'missing_requirements',
          unverifiedFields: ['email_address'],
          verificationAttempts: 0,
          verificationStatus: 'unverified',
        });
        (signUpResponse as any).missing_fields = ['protect_check'];
        (signUpResponse as any).protect_check = createProtectCheck('sandbox-sign-up-challenge');

        const clientState = SessionService.getClientState(null);
        clientState.response.sign_up = signUpResponse as any;

        return createNoStoreResponse({
          client: clientState.response,
          response: signUpResponse,
        });
      }),

      http.patch('*/v1/client/sign_ups/:signUpId/protect_check', async ({ request }) => {
        return resolveSignUpProtectCheck(request);
      }),

      http.post('*/v1/client/sign_ups/:signUpId/protect_check', async ({ request }) => {
        return resolveSignUpProtectCheck(request);
      }),

      http.post('*/v1/client/sign_ins', async ({ request }) => {
        const body = await parseUrlEncodedBody(request);
        const identifier = body.identifier || 'user@example.com';
        SignInService.setIdentifier(identifier);

        const signInResponse = SignInService.createSignInResponse({
          identifier,
          status: 'needs_first_factor',
          verificationAttempts: 0,
          verificationStatus: 'unverified',
        });

        const clientState = SessionService.getClientState(null);
        clientState.response.sign_in = signInResponse as any;

        return createNoStoreResponse({
          client: clientState.response,
          response: signInResponse,
        });
      }),

      http.post('*/v1/client/sign_ins/:signInId/attempt_first_factor', async ({ request }) => {
        const body = await parseUrlEncodedBody(request);
        if (!body.password) {
          return createNoStoreResponse(
            {
              errors: [
                {
                  code: 'form_password_incorrect',
                  long_message: 'Password is incorrect. Try again, or use another method.',
                  message: 'is incorrect',
                  meta: { param_name: 'password' },
                },
              ],
            },
            { status: 422 },
          );
        }

        const signInResponse = SignInService.createSignInResponse({
          status: 'needs_first_factor',
          verificationAttempts: 1,
          verificationStatus: 'verified',
        });
        (signInResponse as any).status = 'needs_protect_check';
        (signInResponse as any).protect_check = createProtectCheck('sandbox-sign-in-challenge');

        const clientState = SessionService.getClientState(null);
        clientState.response.sign_in = signInResponse as any;

        return createNoStoreResponse({
          client: clientState.response,
          response: signInResponse,
        });
      }),

      http.patch('*/v1/client/sign_ins/:signInId/protect_check', async ({ request }) => {
        return resolveSignInProtectCheck(request, environment);
      }),

      http.post('*/v1/client/sign_ins/:signInId/protect_check', async ({ request }) => {
        return resolveSignInProtectCheck(request, environment);
      }),

      ...clerkHandlers,
    ],
    name: 'protect-challenge',
  };
}
