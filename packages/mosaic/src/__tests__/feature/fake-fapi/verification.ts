import type {
  ClientJSON,
  SessionJSON,
  SessionVerificationLevel,
  SessionVerificationStatus,
  SignInFirstFactorJSON,
  SignInSecondFactorJSON,
  VerificationJSON,
} from '@clerk/shared/types';
import { http, HttpResponse } from 'msw';

import { fapiSessionVerification, fapiVerification } from '../fapi';

export type VerificationSecretStrategy = 'password' | 'email_code' | 'phone_code' | 'totp' | 'backup_code';

export interface FakeVerificationState {
  level: SessionVerificationLevel;
  status: SessionVerificationStatus | null;
  firstFactors: SignInFirstFactorJSON[];
  secondFactors: SignInSecondFactorJSON[];
  secrets: Partial<Record<VerificationSecretStrategy, string>>;
  firstFactorVerification: VerificationJSON | null;
  secondFactorVerification: VerificationJSON | null;
}

export type FakeVerificationSeed = Partial<Pick<FakeVerificationState, 'firstFactors' | 'secondFactors' | 'secrets'>>;

export interface VerificationHost {
  client: ClientJSON;
  verification: FakeVerificationState;
}

export function createVerificationState(seed: FakeVerificationSeed = {}): FakeVerificationState {
  return {
    level: 'first_factor',
    status: null,
    firstFactors: [{ strategy: 'password' }],
    secondFactors: [],
    secrets: {},
    firstFactorVerification: null,
    secondFactorVerification: null,
    ...seed,
  };
}

function envelope(response: object, client: ClientJSON) {
  return HttpResponse.json({ response, client });
}

function findSession(state: VerificationHost, id: unknown): SessionJSON | undefined {
  return state.client.sessions.find(session => session.id === id);
}

function missing() {
  return HttpResponse.json({ errors: [{ code: 'resource_not_found', message: 'not found' }] }, { status: 404 });
}

type Stage = 'first' | 'second';

type VerificationRequest = { params: Record<string, unknown>; request: Request };

const REVERIFICATION_LEVELS: readonly string[] = ['first_factor', 'second_factor', 'multi_factor'];
const PREPARABLE_STRATEGIES: readonly string[] = ['email_code', 'phone_code', 'passkey'];

function apiError(status: number, code: string, message: string, longMessage = message, paramName?: string) {
  return HttpResponse.json(
    {
      errors: [
        {
          code,
          message,
          long_message: longMessage,
          ...(paramName ? { meta: { param_name: paramName } } : {}),
        },
      ],
    },
    { status },
  );
}

const verificationErrors = {
  notStarted: () =>
    apiError(
      400,
      'session_reverification_missing',
      'is missing',
      'You need to start a new session verification flow first',
    ),
  invalidState: (action: string, resolution: string) =>
    apiError(
      400,
      'invalid_action_for_session_reverification',
      'Invalid action for session reverification',
      `We were unable to ${action} for this session, as it's not ready for ${resolution}.`,
    ),
  invalidParam: (param: string, value: string | null) =>
    apiError(
      422,
      'form_param_value_invalid',
      'is invalid',
      `${value} does not match one of the allowed values for parameter ${param}`,
      param,
    ),
  missingResource: (param: string) =>
    apiError(
      422,
      'form_resource_not_found',
      'is missing',
      `The resource associated with the supplied ${param} was not found.`,
      param,
    ),
  notSent: () =>
    apiError(
      400,
      'verification_not_sent',
      'not sent',
      'You need to send a verification code before attempting to verify.',
    ),
  passwordIncorrect: () =>
    apiError(
      422,
      'form_password_incorrect',
      'Password is incorrect. Try again, or use another method.',
      undefined,
      'password',
    ),
  codeIncorrect: () => apiError(422, 'form_code_incorrect', 'is incorrect', 'Incorrect code', 'code'),
};

function verificationReply(state: VerificationHost, session: SessionJSON) {
  const { level, status, firstFactors, secondFactors, firstFactorVerification, secondFactorVerification } =
    state.verification;
  const complete = status === 'complete';
  return envelope(
    fapiSessionVerification(session, {
      level,
      status: status ?? 'needs_first_factor',
      supported_first_factors: complete ? null : firstFactors,
      supported_second_factors: status === 'needs_second_factor' ? secondFactors : null,
      first_factor_verification: firstFactorVerification,
      second_factor_verification: secondFactorVerification,
    }),
    state.client,
  );
}

function setStageVerification(state: VerificationHost, stage: Stage, verification: VerificationJSON) {
  state.verification =
    stage === 'first'
      ? { ...state.verification, firstFactorVerification: verification }
      : { ...state.verification, secondFactorVerification: verification };
}

export function verificationHandlers(state: VerificationHost, url: (path: string) => string) {
  const guard = (stage: Stage, action: string, session: SessionJSON | undefined, strategy: string | null) => {
    if (!session) {
      return missing();
    }
    const { status, firstFactors, secondFactors } = state.verification;
    if (status === null) {
      return verificationErrors.notStarted();
    }
    const expected = stage === 'first' ? 'needs_first_factor' : 'needs_second_factor';
    if (status !== expected) {
      return verificationErrors.invalidState(`${action} ${stage} factor`, `${stage} factor verification`);
    }
    const factors: Array<{ strategy: string }> = stage === 'first' ? firstFactors : secondFactors;
    if (!factors.some(factor => factor.strategy === strategy)) {
      return verificationErrors.invalidParam('strategy', strategy);
    }
    return undefined;
  };

  const prepare =
    (stage: Stage) =>
    async ({ params, request }: VerificationRequest) => {
      const session = findSession(state, params.id);
      const body = new URLSearchParams(await request.text());
      const strategy = body.get('strategy');
      const rejected =
        guard(stage, 'prepare', session, strategy) ??
        (strategy && PREPARABLE_STRATEGIES.includes(strategy)
          ? undefined
          : verificationErrors.invalidParam('strategy', strategy));
      if (rejected || !session || !strategy) {
        return rejected;
      }
      const idParam =
        strategy === 'email_code' ? 'email_address_id' : strategy === 'phone_code' ? 'phone_number_id' : null;
      if (idParam) {
        const factors: Array<Record<string, unknown>> =
          stage === 'first' ? state.verification.firstFactors : state.verification.secondFactors;
        const id = body.get(idParam);
        if (!factors.some(factor => factor.strategy === strategy && factor[idParam] === id)) {
          return verificationErrors.missingResource(idParam);
        }
      }
      setStageVerification(state, stage, fapiVerification(strategy));
      return verificationReply(state, session);
    };

  const attempt =
    (stage: Stage) =>
    async ({ params, request }: VerificationRequest) => {
      const session = findSession(state, params.id);
      const body = new URLSearchParams(await request.text());
      const strategy = body.get('strategy');
      const rejected = guard(stage, 'attempt', session, strategy);
      if (rejected || !session || !strategy) {
        return rejected;
      }
      const prepared =
        stage === 'first' ? state.verification.firstFactorVerification : state.verification.secondFactorVerification;
      if (PREPARABLE_STRATEGIES.includes(strategy) && prepared?.strategy !== strategy) {
        return verificationErrors.notSent();
      }
      if (strategy !== 'passkey' && state.verification.secrets[strategy as VerificationSecretStrategy] === undefined) {
        throw new Error(`fake FAPI: no secret seeded for strategy "${strategy}"`);
      }
      if (strategy === 'password') {
        if (body.get('password') !== state.verification.secrets.password) {
          return verificationErrors.passwordIncorrect();
        }
      } else if (strategy !== 'passkey') {
        if (body.get('code') !== state.verification.secrets[strategy as VerificationSecretStrategy]) {
          return verificationErrors.codeIncorrect();
        }
      }
      setStageVerification(state, stage, fapiVerification(strategy, { status: 'verified', attempts: 1 }));
      const status =
        stage === 'first' && state.verification.level === 'multi_factor' ? 'needs_second_factor' : 'complete';
      state.verification = { ...state.verification, status };
      return verificationReply(state, session);
    };

  return [
    http.post(url('/v1/client/sessions/:id/verify'), async ({ params, request }) => {
      const session = findSession(state, params.id);
      if (!session) {
        return missing();
      }
      const requested = new URLSearchParams(await request.text()).get('level');
      if (!requested || !REVERIFICATION_LEVELS.includes(requested)) {
        return verificationErrors.invalidParam('level', requested);
      }
      const level =
        requested === 'first_factor' || state.verification.secondFactors.length === 0
          ? 'first_factor'
          : (requested as SessionVerificationLevel);
      state.verification = {
        ...state.verification,
        level,
        status: level === 'second_factor' ? 'needs_second_factor' : 'needs_first_factor',
        firstFactorVerification: null,
        secondFactorVerification: null,
      };
      return verificationReply(state, session);
    }),
    http.post(url('/v1/client/sessions/:id/verify/prepare_first_factor'), prepare('first')),
    http.post(url('/v1/client/sessions/:id/verify/prepare_second_factor'), prepare('second')),
    http.post(url('/v1/client/sessions/:id/verify/attempt_first_factor'), attempt('first')),
    http.post(url('/v1/client/sessions/:id/verify/attempt_second_factor'), attempt('second')),
  ];
}
