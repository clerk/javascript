import type {
  ClientJSON,
  SessionJSON,
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
  fapiUser,
  fapiVerification,
} from '../fapi';
import { envelope, missing, VERIFICATION_CODE } from './shared';

type Identifier = 'email_address' | 'phone_number';

export interface FakeSignUpSeed {
  takenEmailAddresses?: string[];
  sessionTasks?: SessionJSON['tasks'];
  blocked?: Record<string, string>;
}

export interface FakeSignUpState {
  takenEmailAddresses: string[];
  sessionTasks: SessionJSON['tasks'];
  blocked?: Record<string, string>;
  creations: URLSearchParams[];
  updates: URLSearchParams[];
  preparations: string[];
  attempts: { strategy: string; code: string }[];
}

export function createSignUpState(seed: FakeSignUpSeed = {}): FakeSignUpState {
  return {
    takenEmailAddresses: [],
    sessionTasks: null,
    creations: [],
    updates: [],
    preparations: [],
    attempts: [],
    ...seed,
  };
}

const STRATEGIES: Record<string, Identifier> = { email_code: 'email_address', phone_code: 'phone_number' };
const TEXT_FIELDS = ['email_address', 'phone_number', 'username', 'first_name', 'last_name'] as const;
const createdAt = Date.UTC(2026, 0, 1);

function rejected(code: string, message: string, paramName?: string, status = 422, meta: Record<string, string> = {}) {
  return HttpResponse.json(
    {
      errors: [
        {
          code,
          message,
          long_message: message,
          meta: { ...(paramName ? { param_name: paramName } : {}), ...meta },
        },
      ],
    },
    { status },
  );
}

function verification(
  attribute: { verifications: string[] },
  overrides: Partial<SignUpVerificationJSON> = {},
): SignUpVerificationJSON {
  return {
    ...fapiVerification(''),
    strategy: null,
    status: null,
    next_action: 'needs_prepare',
    supported_strategies: attribute.verifications,
    ...overrides,
  } as SignUpVerificationJSON;
}

export function signUpHandlers(
  state: { client: ClientJSON; environment: FapiEnvironment; signUp: FakeSignUpState },
  fapiUrl: (path: string) => string,
) {
  const settings = () => state.environment.user_settings;
  const current = (id: unknown) => (state.client.sign_up?.id === id ? state.client.sign_up : undefined);
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
    const missingFields = [
      ...required_fields.filter(field => !provided(field)),
      ...(anyIdentifierMissing ? identifierNames : []),
    ];
    const settled: SignUpJSON = {
      ...signUp,
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
        return rejected('form_identifier_exists', 'That email address is taken. Please try another.', 'email_address');
      }
    }
    for (const field of ['email_address', 'phone_number'] as const) {
      if (body.get(field) !== null && body.get(field) !== signUp[field] && next.verifications) {
        next = {
          ...next,
          verifications: { ...next.verifications, [field]: verification(attributes[field]) },
        };
      }
    }
    const password = body.get('password');
    if (password !== null) {
      if (!attributes.password.enabled) {
        return rejected('form_param_unknown', 'password is not a valid parameter for this request.', 'password');
      }
      if (password.length < password_settings.min_length) {
        return rejected(
          'form_password_length_too_short',
          `Passwords must be ${password_settings.min_length} characters or more.`,
          'password',
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
    return next;
  };

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
      const { attributes } = settings();
      const blank: SignUpJSON = {
        object: 'sign_up',
        id: `sua_${state.signUp.creations.length}`,
        status: 'missing_requirements',
        required_fields: [],
        optional_fields: [],
        missing_fields: [],
        unverified_fields: [],
        username: null,
        first_name: null,
        last_name: null,
        email_address: null,
        phone_number: null,
        web3_wallet: null,
        external_account_strategy: null,
        external_account: null,
        has_password: false,
        unsafe_metadata: {},
        created_session_id: null,
        created_user_id: null,
        abandon_at: createdAt + 86_400_000,
        legal_accepted_at: null,
        locale: null,
        timezone: null,
        verifications: {
          email_address: verification(attributes.email_address),
          phone_number: verification(attributes.phone_number),
          web3_wallet: verification({ verifications: [] }),
          external_account: verification({ verifications: [] }),
        },
      };
      const applied = apply(blank, body);
      return applied instanceof HttpResponse ? applied : store(settle(applied));
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
      return applied instanceof HttpResponse ? applied : store(settle(applied));
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
          [field]: verification(attribute, {
            ...fapiVerification(strategy),
            next_action: 'needs_attempt',
            supported_strategies: attribute.verifications,
          }),
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
      state.signUp.attempts.push({ strategy, code });
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
