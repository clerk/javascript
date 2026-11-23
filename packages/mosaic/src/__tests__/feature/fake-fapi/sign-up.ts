import type {
  ClerkAPIErrorJSON,
  ClientJSON,
  PhoneCodeChannel,
  SessionJSON,
  SignInJSON,
  SignUpField,
  SignUpIdentificationField,
  SignUpJSON,
  SignUpVerificationJSON,
} from '@clerk/shared/types';
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
  protectCheckOn?: 'create' | 'update';
  protectCheckExpired?: boolean;
  protectCheckResolvedElsewhere?: boolean;
  protectCheckBlocked?: Record<string, string>;
  protectCheckScript?: string;
  whatsAppEnabled?: boolean;
  whatsAppQuotaExceeded?: boolean;
  tickets?: Record<string, FakeTicket>;
  oauth?: Record<string, FakeOAuthAccount>;
}

export type FakeOAuthAccount =
  | { emailAddress: string; firstName?: string; lastName?: string }
  | { existingUser: { emailAddress: string; secondFactor?: boolean } }
  /** The account is already signed in on this client, in the session with this id. */
  | { signedInSession: string }
  | { error: { code: string; message: string } };

export type FakeTicket = { emailAddress: string } | 'expired';

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
  whatsAppEnabled: boolean;
  whatsAppQuotaExceeded: boolean;
  tickets: Record<string, FakeTicket>;
  oauth: Record<string, FakeOAuthAccount>;
  transfers: URLSearchParams[];
  linkedStrategy?: string;
  returnFromOAuth: () => void;
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
    whatsAppEnabled: true,
    whatsAppQuotaExceeded: false,
    tickets: {},
    oauth: {},
    transfers: [],
    returnFromOAuth: () => {
      throw new Error('The fake FAPI has not started');
    },
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

function apiError(code: string, message: string): ClerkAPIErrorJSON {
  return { code, message, long_message: message, meta: {} };
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
      if (sign_up.progressive && provider?.enabled && provider.required) {
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
    const external = signUp.verifications?.external_account;
    const linked = external?.status === 'verified' ? external.strategy : state.signUp.linkedStrategy;
    const provided = (field: SignUpField) => {
      if (field === 'password') {
        return signUp.has_password || Boolean(linked);
      }
      if (field.startsWith('oauth_')) {
        return field === linked;
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

  const startOAuth = (signUp: SignUpJSON, body: URLSearchParams): SignUpJSON | ReturnType<typeof rejected> => {
    const strategy = body.get('strategy') ?? '';
    const provider = settings().social[strategy as keyof FapiEnvironment['user_settings']['social']];
    if (!provider?.enabled || !provider.authenticatable) {
      return rejected('form_param_value_invalid', 'strategy does not match one of the allowed values.', 'strategy');
    }
    if (!body.get('redirect_url')) {
      return rejected('form_conditional_param_missing', 'redirect_url must be included.', 'redirect_url');
    }
    return {
      ...signUp,
      verifications: {
        ...signUp.verifications,
        external_account: {
          ...fapiUnpreparedVerification(),
          ...fapiVerification(strategy),
          next_action: '',
          supported_strategies: [strategy],
          external_verification_redirect_url: `https://oauth.example/authorize?strategy=${strategy}`,
        },
      },
    };
  };

  state.signUp.returnFromOAuth = () => {
    const signUp = state.client.sign_up;
    const external = signUp?.verifications?.external_account;
    const account = external ? state.signUp.oauth[external.strategy] : undefined;
    if (!signUp?.verifications || !external || !account) {
      throw new Error('No OAuth sign-up to return from');
    }
    const withExternal = (changes: Partial<SignUpVerificationJSON>): SignUpJSON => ({
      ...signUp,
      verifications: { ...signUp.verifications!, external_account: { ...external, ...changes } },
    });
    if ('error' in account) {
      store(withExternal({ status: 'unverified', error: apiError(account.error.code, account.error.message) }));
      return;
    }
    if ('signedInSession' in account) {
      store(
        withExternal({
          status: 'unverified',
          error: {
            ...apiError('identifier_already_signed_in', "You're already signed in."),
            meta: { session_id: account.signedInSession },
          },
        }),
      );
      return;
    }
    if ('existingUser' in account) {
      store(
        withExternal({
          status: 'transferable',
          error: apiError('external_account_exists', 'This account already exists. Sign in instead.'),
        }),
      );
      return;
    }
    const linked = withExternal({ status: 'verified' });
    state.signUp.linkedStrategy = external.strategy;
    store(
      settle({
        ...linked,
        email_address: signUp.email_address ?? account.emailAddress,
        first_name: signUp.first_name ?? account.firstName ?? null,
        last_name: signUp.last_name ?? account.lastName ?? null,
        verifications: {
          ...linked.verifications!,
          email_address: signUp.email_address
            ? linked.verifications!.email_address
            : {
                ...linked.verifications!.email_address,
                ...fapiVerification(`from_${external.strategy}`, { status: 'verified' }),
                next_action: '',
              },
        },
      }),
    );
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

  const prepare = (signUp: SignUpJSON, body: URLSearchParams): SignUpJSON | ReturnType<typeof rejected> => {
    const strategy = body.get('strategy') ?? '';
    const channel = body.get('channel');
    const field = STRATEGIES[strategy];
    const attribute = field ? settings().attributes[field] : undefined;
    if (!field || !attribute?.verifications.some(supported => supported === strategy)) {
      return rejected('form_param_value_invalid', `${strategy} does not match one of the allowed values.`, 'strategy');
    }
    if (!signUp[field]) {
      return rejected('form_param_missing', `${field} must be set before it can be verified.`, field);
    }
    if (signUp.verifications?.[field].status === 'verified') {
      return rejected('verification_already_verified', 'This verification has already been verified.', undefined, 400);
    }
    const isPhone = field === 'phone_number';
    if (isPhone && channel && channel !== 'sms' && channel !== 'whatsapp') {
      return rejected('form_param_value_invalid', `${channel} does not match one of the allowed values.`, 'channel');
    }
    if (isPhone && channel === 'whatsapp' && !state.signUp.whatsAppEnabled) {
      return rejected(
        'whatsapp_channel_not_enabled',
        "The 'whatsapp' channel is not available for this instance.",
        'channel',
      );
    }
    const sentOver = channel === 'whatsapp' && state.signUp.whatsAppQuotaExceeded ? 'sms' : (channel ?? 'sms');
    state.signUp.preparations.push(isPhone && channel ? `${strategy}:${channel}` : strategy);
    return {
      ...signUp,
      verifications: {
        ...signUp.verifications!,
        [field]: {
          ...signUp.verifications![field],
          ...fapiVerification(strategy),
          next_action: 'needs_attempt',
          channel: isPhone ? (sentOver as PhoneCodeChannel) : undefined,
        },
      },
    };
  };

  if (state.client.sign_up) {
    state.client = { ...state.client, sign_up: settle(state.client.sign_up) };
  }

  return [
    http.post(fapiUrl('/v1/client/sign_ins'), async ({ request }) => {
      const body = new URLSearchParams(await request.text());
      const external = state.client.sign_up?.verifications?.external_account;
      const account = external ? state.signUp.oauth[external.strategy] : undefined;
      if (
        body.get('transfer') !== 'true' ||
        external?.status !== 'transferable' ||
        !account ||
        !('existingUser' in account)
      ) {
        return rejected('form_param_missing', 'Only sign-up transfers are supported by the fake FAPI.');
      }
      state.signUp.transfers.push(body);
      const { emailAddress, secondFactor = false } = account.existingUser;
      let createdSessionId: string | null = null;
      if (!secondFactor) {
        const tasks = state.signUp.sessionTasks;
        const session = fapiSession({
          ...(tasks?.length ? { status: 'pending' as const, tasks } : {}),
          id: `sess_transferred_${state.signUp.transfers.length}`,
          user: fapiUser({
            id: 'user_existing',
            email_addresses: [fapiEmailAddress({ id: 'email_existing', email_address: emailAddress })],
          }),
        });
        state.client = { ...state.client, sessions: [...state.client.sessions, session] };
        createdSessionId = session.id;
      }
      const signIn = {
        object: 'sign_in',
        id: `sia_transfer_${state.signUp.transfers.length}`,
        status: secondFactor ? 'needs_second_factor' : 'complete',
        supported_identifiers: [],
        identifier: emailAddress,
        user_data: { first_name: null, last_name: null, image_url: '', has_image: false },
        supported_first_factors: [],
        supported_second_factors: secondFactor ? [{ strategy: 'totp' }] : [],
        first_factor_verification: null,
        second_factor_verification: null,
        created_session_id: createdSessionId,
        timezone: null,
      } as unknown as SignInJSON;
      state.client = { ...state.client, sign_up: null, sign_in: secondFactor ? signIn : null };
      return envelope(signIn, state.client);
    }),
    http.post(fapiUrl('/v1/client/sign_ups'), async ({ request }) => {
      const body = new URLSearchParams(await request.text());
      state.signUp.creations.push(body);
      state.signUp.linkedStrategy = undefined;
      const mode = settings().sign_up.mode;
      if (mode !== 'public' && body.get('strategy') !== 'ticket') {
        return mode === 'waitlist'
          ? rejected(
              'sign_up_restricted_waitlist',
              'Sign-ups are currently unavailable. Join the waitlist, and you will be notified when access becomes available.',
              undefined,
              403,
            )
          : rejected('sign_up_mode_restricted', 'Sign ups are currently disabled.', undefined, 403);
      }
      if (state.signUp.blocked) {
        return rejected('action_blocked', 'This request was blocked.', undefined, 403, state.signUp.blocked);
      }
      const blank = fapiSignUp({ id: `sua_${state.signUp.creations.length}` });
      let start = blank;
      if (body.get('strategy') === 'ticket') {
        const invitation = state.signUp.tickets[body.get('ticket') ?? ''];
        if (!invitation) {
          return rejected(
            'ticket_invalid_code',
            "This ticket is invalid. Make sure you're using a valid ticket generated by Clerk.",
            undefined,
            400,
          );
        }
        if (invitation === 'expired') {
          return rejected('ticket_expired_code', 'This ticket has expired and cannot be used anymore.', undefined, 400);
        }
        start = {
          ...blank,
          email_address: invitation.emailAddress,
          verifications: {
            ...blank.verifications,
            email_address: {
              ...blank.verifications!.email_address,
              ...fapiVerification('ticket', { status: 'verified' }),
              next_action: '',
            },
          },
        };
      }
      if (body.get('strategy')?.startsWith('oauth_')) {
        const started = startOAuth(start, body);
        if (started instanceof HttpResponse) {
          return started;
        }
        start = started;
      }
      const applied = apply(start, body);
      if (applied instanceof HttpResponse) {
        return applied;
      }
      const created = issueProtectCheck(applied);
      const prepared = body.get('strategy') === 'phone_code' ? prepare(created, body) : created;
      if (prepared instanceof HttpResponse) {
        store(settle(created));
        return clientError(prepared);
      }
      return store(settle(prepared));
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
      const started = body.get('strategy')?.startsWith('oauth_') ? startOAuth(signUp, body) : signUp;
      if (started instanceof HttpResponse) {
        return started;
      }
      const applied = apply(started, body);
      if (applied instanceof HttpResponse) {
        return applied;
      }
      const pending = applied.protect_check && !isExpired(applied.protect_check);
      return store(settle(pending ? applied : issueProtectCheck(applied, 'update')));
    }),
    http.post(fapiUrl('/v1/client/sign_ups/:id/prepare_verification'), async ({ params, request }) => {
      const signUp = current(params.id);
      if (!signUp?.verifications) {
        return missing();
      }
      const prepared = prepare(signUp, new URLSearchParams(await request.text()));
      return prepared instanceof HttpResponse ? prepared : store(prepared);
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
