import {
  clerkHandlers,
  EnvironmentService,
  http,
  HttpResponse,
  type MockScenario,
  type RequestHandler,
  SessionService,
  setClerkState,
  SignInService,
  SignUpService,
} from '@clerk/msw';

type BlockMessage = {
  kind?: string;
  title?: string;
  description?: string;
  linkUrl?: string;
  linkText?: string;
};

type Flow = 'signIn' | 'signUp';

const GENERIC_LONG_MESSAGE =
  'This action was detected as suspicious and has been blocked. If you believe this was a mistake, please contact support.';

const OUTDATED_CLERK_JS: Record<Flow, BlockMessage> = {
  signIn: {
    kind: 'clerk_js_outdated',
    title: "We couldn't sign you in",
    description:
      "This app uses an outdated version of Clerk, so signing in isn't available right now. If you're the developer, upgrade your Clerk SDK to the latest version.",
    linkUrl: 'https://clerk.com/docs/guides/development/upgrading/overview',
    linkText: 'Clerk upgrade guides',
  },
  signUp: {
    kind: 'clerk_js_outdated',
    title: "We couldn't complete your sign-up",
    description:
      "This app uses an outdated version of Clerk, so signing up isn't available right now. If you're the developer, upgrade your Clerk SDK to the latest version.",
    linkUrl: 'https://clerk.com/docs/guides/development/upgrading/overview',
    linkText: 'Clerk upgrade guides',
  },
};

const NETWORK_MESSAGE: BlockMessage = {
  title: "We couldn't complete your sign-up",
  description:
    "Sign-ups from this network aren't allowed. If you're using a VPN or proxy, turn it off and try again, or switch to a different network.",
};

const ENDPOINTS = {
  signIn: '*/v1/client/sign_ins/:signInId',
  signUp: '*/v1/client/sign_ups/:signUpId',
  signInCreate: '*/v1/client/sign_ins',
  signInAttempt: '*/v1/client/sign_ins/:signInId/attempt_first_factor',
  signInProtectCheck: '*/v1/client/sign_ins/:signInId/protect_check',
  signUpCreate: '*/v1/client/sign_ups',
  signUpAttempt: '*/v1/client/sign_ups/:signUpId/attempt_verification',
  signUpProtectCheck: '*/v1/client/sign_ups/:signUpId/protect_check',
};

const CHALLENGE_SDK_URL = 'https://protect-challenge.sandbox.test/challenge.js';

const CHALLENGE_SDK_SOURCE = `
export default (container, { setWidgetVisible }) =>
  new Promise((resolve, reject) => {
    const box = document.createElement('div');
    box.style.cssText =
      'display:flex;flex-direction:column;gap:8px;align-items:center;padding:16px;border:1px dashed #a3a3a3;border-radius:8px;font:13px system-ui';
    const label = document.createElement('div');
    label.textContent = 'Simulated Protect challenge';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px';
    const button = (text, onClick) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.textContent = text;
      el.style.cssText = 'padding:6px 12px;border:1px solid #a3a3a3;border-radius:6px;background:transparent;color:inherit;cursor:pointer';
      el.addEventListener('click', onClick);
      return el;
    };
    row.append(
      button('Pass', () => resolve('sandbox-proof-token')),
      button('Fail', () => reject(new Error('Simulated challenge failure'))),
    );
    box.append(label, row);
    container.append(box);
    if (setWidgetVisible) setWidgetVisible(true);
  });
`;

function reference() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

function blocked(message: BlockMessage = {}) {
  const traceId = reference();
  return HttpResponse.json(
    {
      errors: [
        {
          code: 'action_blocked',
          message: message.title ?? 'Action blocked',
          long_message: `${message.description ?? GENERIC_LONG_MESSAGE} Reference: ${traceId}`,
          meta: {
            trace_id: traceId,
            kind: message.kind,
            title: message.title,
            description: message.description,
            link_url: message.linkUrl,
            link_text: message.linkText,
          },
        },
      ],
      clerk_trace_id: traceId,
    },
    { status: 403, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, private' } },
  );
}

function blockAt(endpoint: string, message?: BlockMessage): RequestHandler {
  return http.post(endpoint, () => blocked(message));
}

function noStore(body: unknown) {
  return HttpResponse.json(body as Record<string, unknown>, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, private' },
  });
}

function pendingProtectCheck() {
  return {
    status: 'pending',
    token: `sandbox_${reference()}`,
    sdk_url: CHALLENGE_SDK_URL,
    expires_at: Date.now() + 10 * 60 * 1000,
  };
}

async function formField(request: Request, name: string) {
  return new URLSearchParams(await request.text()).get(name);
}

function signInResource(response: Record<string, unknown>) {
  const client = SessionService.getClientState(null);
  client.response.sign_in = response as any;
  return noStore({ client: client.response, response });
}

function signUpResource(response: Record<string, unknown>) {
  const client = SessionService.getClientState(null);
  client.response.sign_up = response as any;
  return noStore({ client: client.response, response });
}

function challengeHandlers(afterChallenge: 'continue' | 'blocked'): RequestHandler[] {
  return [
    http.get(CHALLENGE_SDK_URL, () => {
      return new HttpResponse(CHALLENGE_SDK_SOURCE, {
        headers: { 'Content-Type': 'text/javascript', 'Access-Control-Allow-Origin': '*' },
      });
    }),
    http.post(ENDPOINTS.signInCreate, async ({ request }) => {
      const identifier = (await formField(request, 'identifier')) || 'user@example.com';
      SignInService.setIdentifier(identifier);
      const signIn = Object.assign(SignInService.createSignInResponse({ identifier }), {
        status: 'needs_protect_check',
        protect_check: pendingProtectCheck(),
      });
      return signInResource(signIn);
    }),
    http.get(ENDPOINTS.signIn, () => {
      const signIn = SignInService.getCurrentSignIn();
      return signIn ? signInResource(signIn) : undefined;
    }),
    http.post(ENDPOINTS.signInProtectCheck, () => {
      return afterChallenge === 'blocked' ? blocked() : signInResource(SignInService.createSignInResponse());
    }),
    http.post(ENDPOINTS.signUpCreate, async ({ request }) => {
      const email = (await formField(request, 'email_address')) || 'user@example.com';
      SignUpService.setEmail(email);
      const signUp = SignUpService.createSignUpResponse({ email });
      Object.assign(signUp, {
        missing_fields: [...signUp.missing_fields, 'protect_check'],
        protect_check: pendingProtectCheck(),
      });
      return signUpResource(signUp);
    }),
    http.get(ENDPOINTS.signUp, () => {
      const signUp = SignUpService.getCurrentSignUp();
      return signUp ? signUpResource(signUp) : undefined;
    }),
    http.post(ENDPOINTS.signUpProtectCheck, () => {
      return afterChallenge === 'blocked' ? blocked() : signUpResource(SignUpService.createSignUpResponse());
    }),
  ];
}

function signedOutScenario(name: string, description: string, overrides: RequestHandler[]): MockScenario {
  setClerkState({ environment: structuredClone(EnvironmentService.SINGLE_SESSION), session: null });
  return { description, handlers: [...overrides, ...clerkHandlers], name };
}

export function ProtectBlockedGeneric(): MockScenario {
  return signedOutScenario(
    'protect-blocked-generic',
    'Sign-in and sign-up are blocked on the first submit, with the default message',
    [blockAt(ENDPOINTS.signInCreate), blockAt(ENDPOINTS.signUpCreate)],
  );
}

export function ProtectBlockedOutdatedClerkJS(): MockScenario {
  return signedOutScenario(
    'protect-blocked-outdated-clerk-js',
    'Sign-in and sign-up are blocked on the first submit, with the outdated ClerkJS message and link',
    [
      blockAt(ENDPOINTS.signInCreate, OUTDATED_CLERK_JS.signIn),
      blockAt(ENDPOINTS.signUpCreate, OUTDATED_CLERK_JS.signUp),
    ],
  );
}

export function ProtectBlockedNetwork(): MockScenario {
  return signedOutScenario(
    'protect-blocked-network',
    'Sign-up is blocked on the first submit, with the network message',
    [blockAt(ENDPOINTS.signUpCreate, NETWORK_MESSAGE)],
  );
}

export function ProtectBlockedAtVerification(): MockScenario {
  return signedOutScenario(
    'protect-blocked-at-verification',
    'The first submit succeeds, then the password or email code submit is blocked',
    [blockAt(ENDPOINTS.signInAttempt), blockAt(ENDPOINTS.signUpAttempt)],
  );
}

export function ProtectChallenge(): MockScenario {
  return signedOutScenario(
    'protect-challenge',
    'Sign-in and sign-up require a challenge after the first submit; pass or fail the simulated challenge',
    challengeHandlers('continue'),
  );
}

export function ProtectChallengeThenBlocked(): MockScenario {
  return signedOutScenario(
    'protect-challenge-then-blocked',
    'Sign-in and sign-up require a challenge after the first submit, then are blocked once it is solved',
    challengeHandlers('blocked'),
  );
}
