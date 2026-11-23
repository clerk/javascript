import type { ClientJSON, SessionJSON, SignUpField, SignUpIdentificationField, SignUpJSON } from '@clerk/shared/types';
import { http, HttpResponse } from 'msw';

import {
  fapiEmailAddress,
  type FapiEnvironment,
  fapiPhoneNumber,
  fapiSession,
  fapiSignUp,
  fapiUnpreparedVerification,
  fapiUser,
  fapiVerification,
} from '../fapi';
import { envelope, missing, VERIFICATION_CODE } from './shared';

type Identifier = 'email_address' | 'phone_number';

export interface FakeSignUpSeed {
  takenEmailAddresses?: string[];
  enterpriseDomains?: string[];
  sessionTasks?: SessionJSON['tasks'];
  blocked?: Record<string, string>;
  weakPasswords?: Record<string, string[]>;
  protectChecks?: number;
  /** The request that raises the Protect check: `create` (default) or the continue screen's `update`. */
  protectCheckOn?: 'create' | 'update';
  /** Issue each Protect check already expired. */
  protectCheckExpired?: boolean;
  /** Resolve the Protect check server-side before the proof arrives, as when another tab solved it. */
  protectCheckResolvedElsewhere?: boolean;
  /** Answer the proof with `action_blocked` and these meta values. */
  protectCheckBlocked?: Record<string, string>;
  /** The challenge script's source, served at a URL unique to this fake. */
  protectCheckScript?: string;
}

export interface FakeSignUpState {
  takenEmailAddresses: string[];
  enterpriseDomains: string[];
  sessionTasks: SessionJSON['tasks'];
  blocked?: Record<string, string>;
  weakPasswords: Record<string, string[]>;
  protectChecks: number;
  protectCheckOn?: 'create' | 'update';
  protectCheckExpired?: boolean;
  protectCheckResolvedElsewhere?: boolean;
  protectCheckBlocked?: Record<string, string>;
  protectCheckScript?: string;
  issuedProtectChecks: number;
  reloads: number;
  proofTokens: string[];
  creations: URLSearchParams[];
  updates: URLSearchParams[];
  preparations: string[];
}

export function createSignUpState(seed: FakeSignUpSeed = {}): FakeSignUpState {
  return {
    takenEmailAddresses: [],
    enterpriseDomains: [],
    sessionTasks: null,
    weakPasswords: {},
    protectChecks: 0,
    issuedProtectChecks: 0,
    reloads: 0,
    proofTokens: [],
    creations: [],
    updates: [],
    preparations: [],
    ...seed,
  };
}

export const PROTECT_CHECK_SCRIPT = `
export default (container, { token, setWidgetVisible }) =>
  new Promise((resolve, reject) => {
    const pass = document.createElement('button');
    pass.type = 'button';
    pass.textContent = 'I am human';
    pass.onclick = async () => {
      await setWidgetVisible?.(false);
      resolve('proof_' + token);
    };
    const fail = document.createElement('button');
    fail.type = 'button';
    fail.textContent = 'Fail the challenge';
    fail.onclick = async () => {
      await setWidgetVisible?.(false);
      reject(new Error('challenge failed'));
    };
    container.replaceChildren(pass, fail);
    void setWidgetVisible?.(true);
  });
`;

let scriptIds = 0;

const STRATEGIES: Record<string, Identifier> = { email_code: 'email_address', phone_code: 'phone_number' };
const TEXT_FIELDS = ['email_address', 'phone_number', 'username', 'first_name', 'last_name'] as const;
const createdAt = Date.UTC(2026, 0, 1);

function formError(code: string, message: string, paramName?: string, meta: Record<string, unknown> = {}) {
  return { code, message, long_message: message, meta: { ...(paramName ? { param_name: paramName } : {}), ...meta } };
}

function rejected(code: string, message: string, paramName?: string, status = 422, meta: Record<string, unknown> = {}) {
  return HttpResponse.json({ errors: [formError(code, message, paramName, meta)] }, { status });
}

export function signUpHandlers(
  state: { client: ClientJSON; environment: FapiEnvironment; signUp: FakeSignUpState },
  fapiUrl: (path: string) => string,
) {
  const settings = () => state.environment.user_settings;
  const current = (id: unknown) => (state.client.sign_up?.id === id ? state.client.sign_up : undefined);
  const scriptId = (scriptIds += 1);
  const protectCheck = (expired: boolean): NonNullable<SignUpJSON['protect_check']> => {
    state.signUp.issuedProtectChecks += 1;
    return {
      status: 'pending',
      token: `ptk_${state.signUp.issuedProtectChecks}`,
      sdk_url: fapiUrl(`/protect-check/challenge.js?round=${state.signUp.issuedProtectChecks}&script=${scriptId}`),
      ...(expired ? { expires_at: 1 } : {}),
    };
  };
  const issueProtectCheck = (signUp: SignUpJSON, on: 'create' | 'update' = 'create'): SignUpJSON => {
    if (
      (state.signUp.protectCheckOn ?? 'create') !== on ||
      state.signUp.issuedProtectChecks >= state.signUp.protectChecks
    ) {
      return { ...signUp, protect_check: null };
    }
    return { ...signUp, protect_check: protectCheck(Boolean(state.signUp.protectCheckExpired)) };
  };
  const isExpired = (check: NonNullable<SignUpJSON['protect_check']>) =>
    check.expires_at !== undefined && check.expires_at < Date.now();

  // FAPI wraps a sign-up error with the client (clerk_go api/fapi/v1/wrapper/wrapper.go WrapError), and clerk-js applies it.
  const clientError = async (response: Response) => {
    const body = (await response.json()) as object;
    return HttpResponse.json({ ...body, meta: { client: state.client } }, { status: response.status });
  };

  const store = (signUp: SignUpJSON) => {
    state.client = { ...state.client, sign_up: signUp.status === 'complete' ? null : signUp };
    return envelope(signUp, state.client);
  };

  const combinesEmailOrPhone = () => {
    const { attributes, sign_up } = settings();
    return (
      !sign_up.progressive &&
      attributes.email_address.used_for_first_factor &&
      attributes.phone_number.used_for_first_factor
    );
  };

  const requirements = (): Pick<SignUpJSON, 'required_fields' | 'optional_fields'> => {
    const { attributes, sign_up } = settings();
    const names = ['email_address', 'phone_number', 'username', 'first_name', 'last_name', 'password'] as const;
    const combined = combinesEmailOrPhone();
    const enabled = names.filter(
      name => attributes[name].enabled && !(combined && (name === 'email_address' || name === 'phone_number')),
    );
    const required: SignUpField[] = enabled.filter(name => attributes[name].required);
    if (combined) {
      required.push('email_address_or_phone_number');
    }
    for (const provider of Object.values(settings().social)) {
      if (provider?.enabled && provider.required) {
        required.push(provider.strategy);
      }
    }
    return {
      required_fields: sign_up.legal_consent_enabled ? [...required, 'legal_accepted'] : required,
      optional_fields: enabled.filter(name => !attributes[name].required),
    };
  };

  const settle = (signUp: SignUpJSON): SignUpJSON => {
    const { attributes } = settings();
    const { required_fields, optional_fields } = requirements();
    const provided = (field: SignUpField) => {
      if (field === 'password') {
        return signUp.has_password;
      }
      if (field === 'legal_accepted') {
        return signUp.legal_accepted_at !== null;
      }
      if (field === 'email_address_or_phone_number') {
        return Boolean(signUp.email_address || signUp.phone_number);
      }
      return Boolean(signUp[field as (typeof TEXT_FIELDS)[number]]);
    };
    const identifiers: SignUpIdentificationField[] = ['email_address', 'phone_number'];
    const unverified = identifiers.filter(
      field =>
        signUp[field as Identifier] &&
        attributes[field as Identifier].verify_at_sign_up &&
        signUp.verifications?.[field as Identifier].status !== 'verified',
    );
    const identifierNames = (['email_address', 'phone_number', 'username'] as const).filter(
      name => attributes[name].enabled,
    );
    const anyIdentifierMissing =
      settings().sign_up.progressive &&
      identifierNames.every(name => !attributes[name].required) &&
      !identifierNames.some(name => provided(name));
    const enterprise = state.signUp.enterpriseDomains.includes(signUp.email_address?.split('@')[1] ?? '');
    const missingFields: SignUpField[] = [
      ...required_fields.filter(field => !provided(field)),
      ...(anyIdentifierMissing ? identifierNames : []),
      ...(enterprise ? (['enterprise_sso'] as const) : []),
      ...(signUp.protect_check ? (['protect_check'] as const) : []),
    ];
    const settled: SignUpJSON = {
      ...signUp,
      verifications: signUp.verifications && {
        ...signUp.verifications,
        email_address: {
          ...signUp.verifications.email_address,
          supported_strategies: attributes.email_address.verifications,
        },
        phone_number: {
          ...signUp.verifications.phone_number,
          supported_strategies: attributes.phone_number.verifications,
        },
      },
      required_fields,
      optional_fields,
      missing_fields: missingFields,
      unverified_fields: unverified,
    };
    if (missingFields.length > 0 || unverified.length > 0) {
      return { ...settled, status: 'missing_requirements' };
    }
    const number = state.client.sessions.length + 1;
    const user = fapiUser({
      id: `user_signed_up_${number}`,
      first_name: signUp.first_name,
      last_name: signUp.last_name,
      username: signUp.username,
      email_addresses: signUp.email_address
        ? [
            fapiEmailAddress({
              id: `email_signed_up_${number}`,
              email_address: signUp.email_address,
              verification: fapiVerification('email_code', { status: 'verified' }),
            }),
          ]
        : [],
      phone_numbers: signUp.phone_number
        ? [fapiPhoneNumber({ id: `phone_signed_up_${number}`, phone_number: signUp.phone_number })]
        : [],
    });
    const tasks = state.signUp.sessionTasks;
    const session = fapiSession({
      id: `sess_signed_up_${number}`,
      user,
      ...(tasks?.length ? { status: 'pending' as const, tasks } : {}),
    });
    state.client = { ...state.client, sessions: [...state.client.sessions, session] };
    return { ...settled, status: 'complete', created_session_id: session.id, created_user_id: user.id };
  };

  const apply = (signUp: SignUpJSON, body: URLSearchParams) => {
    const { attributes, password_settings } = settings();
    const errors: ReturnType<typeof formError>[] = [];
    let next = signUp;
    for (const field of TEXT_FIELDS) {
      const value = body.get(field);
      if (value === null) {
        continue;
      }
      if (!attributes[field].enabled) {
        return rejected('form_param_unknown', `${field} is not a valid parameter for this request.`, field);
      }
      next = { ...next, [field]: value || null };
    }
    const email = body.get('email_address');
    if (email !== null) {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return rejected('form_param_format_invalid', 'email_address must be a valid email address.', 'email_address');
      }
      if (state.signUp.takenEmailAddresses.includes(email)) {
        errors.push(
          formError('form_identifier_exists', 'That email address is taken. Please try another.', 'email_address'),
        );
      }
    }
    for (const field of ['email_address', 'phone_number'] as const) {
      if (body.get(field) && next.verifications) {
        next = {
          ...next,
          verifications: { ...next.verifications, [field]: fapiUnpreparedVerification() },
        };
      }
    }
    const password = body.get('password');
    if (password !== null) {
      if (!attributes.password.enabled) {
        return rejected('form_param_unknown', 'password is not a valid parameter for this request.', 'password');
      }
      const suggestions = state.signUp.weakPasswords[password];
      if (password.length < password_settings.min_length) {
        errors.push(
          formError(
            'form_password_length_too_short',
            `Passwords must be ${password_settings.min_length} characters or more.`,
            'password',
          ),
        );
      } else if (suggestions) {
        errors.push(
          formError('form_password_not_strong_enough', 'Given password is not strong enough.', 'password', {
            zxcvbn: { suggestions: suggestions.map(code => ({ code, message: code })) },
          }),
        );
      }
      next = { ...next, has_password: true };
    }
    if (body.get('legal_accepted') === 'true') {
      next = { ...next, legal_accepted_at: createdAt };
    }
    const metadata = body.get('unsafe_metadata');
    if (metadata !== null) {
      next = { ...next, unsafe_metadata: JSON.parse(metadata) as SignUpJSON['unsafe_metadata'] };
    }
    if (errors.length > 0) {
      return HttpResponse.json({ errors }, { status: 422 });
    }
    return next;
  };

  if (state.client.sign_up) {
    state.client = { ...state.client, sign_up: settle(state.client.sign_up) };
  }

  return [
    http.post(fapiUrl('/v1/client/sign_ups'), async ({ request }) => {
      const body = new URLSearchParams(await request.text());
      state.signUp.creations.push(body);
      if (settings().sign_up.mode !== 'public') {
        return rejected('sign_up_mode_restricted', 'Sign ups are currently disabled.', undefined, 403);
      }
      if (state.signUp.blocked) {
        return rejected('action_blocked', 'This request was blocked.', undefined, 403, state.signUp.blocked);
      }
      const blank = fapiSignUp({ id: `sua_${state.signUp.creations.length}` });
      const applied = apply(blank, body);
      return applied instanceof HttpResponse ? applied : store(settle(issueProtectCheck(applied)));
    }),
    http.get(fapiUrl('/protect-check/challenge.js'), () =>
      HttpResponse.text(state.signUp.protectCheckScript ?? PROTECT_CHECK_SCRIPT, {
        headers: { 'Content-Type': 'text/javascript', 'Access-Control-Allow-Origin': '*' },
      }),
    ),
    http.post(fapiUrl('/v1/client/sign_ups/:id/protect_check'), async ({ params, request }) => {
      if (new URL(request.url).searchParams.get('_method') !== 'PATCH') {
        return undefined;
      }
      const signUp = current(params.id);
      if (!signUp) {
        return missing();
      }
      const proofToken = new URLSearchParams(await request.text()).get('proof_token');
      if (!proofToken) {
        return rejected('form_param_missing', 'proof_token must be included.', 'proof_token');
      }
      if (state.signUp.protectCheckBlocked) {
        return rejected(
          'action_blocked',
          'This request was blocked.',
          undefined,
          403,
          state.signUp.protectCheckBlocked,
        );
      }
      // clerk_go api/shared/sign_up/service.go ResolveProtectCheck: no pending check is a 404, and a
      // rejected proof is answered with a replacement challenge rather than an error.
      if (state.signUp.protectCheckResolvedElsewhere || !signUp.protect_check) {
        store(settle({ ...signUp, protect_check: null }));
        return clientError(missing());
      }
      state.signUp.proofTokens.push(proofToken);
      if (proofToken !== `proof_${signUp.protect_check.token}`) {
        return store(settle({ ...signUp, protect_check: protectCheck(false) }));
      }
      return store(settle(issueProtectCheck({ ...signUp, protect_check: null }, state.signUp.protectCheckOn)));
    }),
    http.get(fapiUrl('/v1/client/sign_ups/:id'), ({ params }) => {
      const signUp = current(params.id);
      if (!signUp) {
        return missing();
      }
      state.signUp.reloads += 1;
      return store(signUp);
    }),
    http.post(fapiUrl('/v1/client/sign_ups/:id'), async ({ params, request }) => {
      if (new URL(request.url).searchParams.get('_method') !== 'PATCH') {
        return undefined;
      }
      const signUp = current(params.id);
      if (!signUp) {
        return missing();
      }
      const body = new URLSearchParams(await request.text());
      state.signUp.updates.push(body);
      const applied = apply(signUp, body);
      if (applied instanceof HttpResponse) {
        return applied;
      }
      // clerk_go runProtectCheck returns a pending, unexpired check unchanged and asks Protect again otherwise.
      const pending = applied.protect_check && !isExpired(applied.protect_check);
      return store(settle(pending ? applied : issueProtectCheck(applied, 'update')));
    }),
    http.post(fapiUrl('/v1/client/sign_ups/:id/prepare_verification'), async ({ params, request }) => {
      const signUp = current(params.id);
      if (!signUp?.verifications) {
        return missing();
      }
      const strategy = new URLSearchParams(await request.text()).get('strategy') ?? '';
      const field = STRATEGIES[strategy];
      const attribute = field ? settings().attributes[field] : undefined;
      if (!field || !attribute?.verifications.some(supported => supported === strategy)) {
        return rejected(
          'form_param_value_invalid',
          `${strategy} does not match one of the allowed values.`,
          'strategy',
        );
      }
      if (!signUp[field]) {
        return rejected('form_param_missing', `${field} must be set before it can be verified.`, field);
      }
      if (signUp.verifications[field].status === 'verified') {
        return rejected(
          'verification_already_verified',
          'This verification has already been verified.',
          undefined,
          400,
        );
      }
      state.signUp.preparations.push(strategy);
      return store({
        ...signUp,
        verifications: {
          ...signUp.verifications,
          [field]: { ...signUp.verifications[field], ...fapiVerification(strategy), next_action: 'needs_attempt' },
        },
      });
    }),
    http.post(fapiUrl('/v1/client/sign_ups/:id/attempt_verification'), async ({ params, request }) => {
      const signUp = current(params.id);
      if (!signUp?.verifications) {
        return missing();
      }
      const body = new URLSearchParams(await request.text());
      const strategy = body.get('strategy') ?? '';
      const code = body.get('code') ?? '';
      const field = STRATEGIES[strategy];
      if (!field) {
        return rejected(
          'form_param_value_invalid',
          `${strategy} does not match one of the allowed values.`,
          'strategy',
        );
      }
      const pending = signUp.verifications[field];
      if (pending.strategy !== strategy || pending.next_action !== 'needs_attempt') {
        return rejected(
          'verification_missing',
          'This verification has not been prepared. Request a code first.',
          undefined,
          400,
        );
      }
      if (code !== VERIFICATION_CODE) {
        store({
          ...signUp,
          verifications: { ...signUp.verifications, [field]: { ...pending, attempts: (pending.attempts ?? 0) + 1 } },
        });
        return rejected('form_code_incorrect', 'Incorrect code', 'code');
      }
      return store(
        settle({
          ...signUp,
          verifications: {
            ...signUp.verifications,
            [field]: { ...pending, status: 'verified', next_action: '', attempts: (pending.attempts ?? 0) + 1 },
          },
        }),
      );
    }),
  ];
}
