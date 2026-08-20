import type {
  AddContactFlowState,
  ConfirmContactActionState,
  ContactKind,
  ContactVerificationStrategy,
  EditAvatarState,
  EditNameState,
  EditUsernameState,
  ProfileField,
  ReverificationChallengeState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

/**
 * A simulated backend for the user-profile account section's flows.
 *
 * This is the layer a state machine and its Clerk controller will replace. It exists so the views
 * can be exercised against real latency, real failure and real step transitions before any of that
 * is built — every delay here becomes a machine `invoke`, and every branch a guard.
 *
 * Nothing in this file ships; it lives in swingset on purpose.
 */

/** Anything the flow needs the "server" to decide, exposed as story controls. */
export interface AccountSectionFlowConfig {
  /** Round-trip latency, in ms, for every simulated call. */
  latencyMs: number;
  /**
   * How the instance verifies email. Mirrors the legacy strategy pick: an address matching an
   * enterprise connection wins, otherwise instance-wide email links, otherwise a code.
   */
  emailStrategy: Extract<ContactVerificationStrategy, 'email_code' | 'email_link'>;
  /** Domains routed to enterprise SSO, overriding `emailStrategy`. */
  ssoDomains: string[];
  ssoProviderName: string;
  /** Identifiers the server rejects as already taken. */
  takenIdentifiers: string[];
  /** The only code the simulated server accepts. */
  validCode: string;
  /** Raise a reverification challenge before each mutation. */
  requireReverification: boolean;
  reverificationStrategy: ReverificationChallengeState['strategy'];
  /** The only password the simulated reverification accepts. */
  validPassword: string;
  /** Fail the next call with an unattributed (no `paramName`) error. */
  failWithFormError: boolean;
  /** How an email link resolves once the simulated user "clicks" it. */
  emailLinkOutcome: 'verified' | 'verified_other_tab' | 'expired' | 'failed';
  /** ms before the simulated email link resolves. `0` waits forever. */
  emailLinkResolveMs: number;
  /** Fail the enterprise SSO popup instead of returning verified. */
  ssoFails: boolean;
  /**
   * An account with an active enterprise connection: legacy renders the name form read-only.
   * Username and avatar stay editable.
   */
  enterpriseManaged: boolean;
  /** Usernames the simulated server rejects as already taken. */
  takenUsernames: string[];
}

export const DEFAULT_ACCOUNT_SECTION_FLOW_CONFIG: AccountSectionFlowConfig = {
  latencyMs: 900,
  emailStrategy: 'email_code',
  ssoDomains: ['acmecorp.com'],
  ssoProviderName: 'Okta',
  takenIdentifiers: ['taken@clerk.dev'],
  validCode: '424242',
  requireReverification: false,
  reverificationStrategy: 'password',
  validPassword: 'clerk',
  failWithFormError: false,
  emailLinkOutcome: 'verified',
  emailLinkResolveMs: 6000,
  ssoFails: false,
  enterpriseManaged: false,
  takenUsernames: ['prestonxyz'],
};

/** Mirrors the legacy uploader, which enforces both before calling the server. */
const AVATAR_MAX_BYTES = 10 * 1000 * 1000;
const AVATAR_MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

/** Cooldown the link step's resend runs, matching the legacy 60s throttled TimerButton. */
const LINK_RESEND_COOLDOWN_S = 60;

const IDLE_RESEND = { isResending: false, secondsRemaining: 0 };

export interface ContactRecord {
  id: string;
  value: string;
  isDefault?: boolean;
  isVerified?: boolean;
  canRemove?: boolean;
}

export type PendingConfirm =
  | { action: 'remove'; kind: ContactKind; id: string }
  | { action: 'set-primary'; kind: ContactKind; id: string };

export interface ProfileIdentity {
  firstName: string;
  lastName: string;
  username: string;
  imageUrl?: string;
}

type EditState =
  | { field: 'name'; state: EditNameState }
  | { field: 'username'; state: EditUsernameState }
  | { field: 'avatar'; state: EditAvatarState };

interface FlowState {
  add: { kind: ContactKind; state: AddContactFlowState } | null;
  edit: EditState | null;
  identity: ProfileIdentity;
  confirm: { pending: PendingConfirm; state: ConfirmContactActionState } | null;
  /** Stacked over whichever surface is open. Null when no challenge is outstanding. */
  reverification: ReverificationChallengeState | null;
  emails: ContactRecord[];
  phones: ContactRecord[];
}

type Action =
  | { type: 'add.open'; kind: ContactKind }
  | { type: 'add.value'; value: string }
  | { type: 'add.submitting' }
  | { type: 'add.error'; errors: { field?: string; form?: string } }
  | { type: 'add.preparing'; identifier: string; strategy: ContactVerificationStrategy }
  | { type: 'add.verify'; identifier: string; strategy: ContactVerificationStrategy; providerName: string }
  | { type: 'add.code'; code: string }
  | { type: 'add.codeStatus'; status: 'idle' | 'verifying' | 'error' | 'success'; message?: string }
  | { type: 'add.resend'; isResending: boolean; cooldown?: number }
  | { type: 'add.tick' }
  | { type: 'add.linkOutcome'; outcome: 'verified_other_tab' | 'expired' | 'failed' }
  | { type: 'add.ssoStatus'; status: 'idle' | 'awaiting_popup' | 'error'; message?: string }
  | { type: 'add.success'; identifier: string }
  | { type: 'add.close' }
  | { type: 'confirm.open'; pending: PendingConfirm; identifier: string }
  | { type: 'confirm.submitting' }
  | { type: 'confirm.error'; message: string }
  | { type: 'confirm.close' }
  | { type: 'reverification.open'; state: ReverificationChallengeState }
  | { type: 'reverification.value'; value: string }
  | { type: 'reverification.status'; status: 'idle' | 'verifying' | 'error'; message?: string }
  | { type: 'reverification.resend'; isResending: boolean }
  | { type: 'reverification.close' }
  | { type: 'edit.open'; field: ProfileField; identity: ProfileIdentity; hasUsername: boolean; readOnly: boolean }
  | { type: 'edit.name'; key: 'firstName' | 'lastName'; value: string }
  | { type: 'edit.username'; value: string }
  | { type: 'edit.avatarFile'; fileName: string; previewUrl: string }
  | { type: 'edit.busy'; busy: boolean; status?: EditAvatarState['status'] }
  | { type: 'edit.error'; errors: { field?: string; form?: string; firstName?: string; lastName?: string } }
  | { type: 'edit.close' }
  | { type: 'identity.set'; identity: Partial<ProfileIdentity> }
  | { type: 'contacts.add'; kind: ContactKind; record: ContactRecord }
  | { type: 'contacts.remove'; kind: ContactKind; id: string }
  | { type: 'contacts.setPrimary'; kind: ContactKind; id: string };

function updateContacts(
  state: FlowState,
  kind: ContactKind,
  update: (records: ContactRecord[]) => ContactRecord[],
): FlowState {
  return kind === 'email' ? { ...state, emails: update(state.emails) } : { ...state, phones: update(state.phones) };
}

function reducer(state: FlowState, action: Action): FlowState {
  switch (action.type) {
    case 'add.open':
      return {
        ...state,
        add: {
          kind: action.kind,
          state: { step: 'identifier', value: action.kind === 'phone' ? '+1' : '', isSubmitting: false, errors: {} },
        },
      };
    case 'add.value':
      if (state.add?.state.step !== 'identifier') {
        return state;
      }
      return { ...state, add: { ...state.add, state: { ...state.add.state, value: action.value, errors: {} } } };
    case 'add.submitting':
      if (state.add?.state.step !== 'identifier') {
        return state;
      }
      return { ...state, add: { ...state.add, state: { ...state.add.state, isSubmitting: true, errors: {} } } };
    case 'add.error':
      if (state.add?.state.step !== 'identifier') {
        return state;
      }
      return {
        ...state,
        add: { ...state.add, state: { ...state.add.state, isSubmitting: false, errors: action.errors } },
      };
    case 'add.preparing':
      if (!state.add) {
        return state;
      }
      return {
        ...state,
        add: {
          ...state.add,
          state: { step: 'preparing', identifier: action.identifier, strategy: action.strategy },
        },
      };
    case 'add.verify': {
      if (!state.add) {
        return state;
      }
      if (action.strategy === 'email_link') {
        return {
          ...state,
          add: {
            ...state.add,
            state: {
              step: 'link',
              identifier: action.identifier,
              // The legacy link card starts its resend disabled and throttled.
              resend: { isResending: false, secondsRemaining: LINK_RESEND_COOLDOWN_S },
              errors: {},
            },
          },
        };
      }
      if (action.strategy === 'enterprise_sso') {
        return {
          ...state,
          add: {
            ...state.add,
            state: {
              step: 'sso',
              identifier: action.identifier,
              providerName: action.providerName,
              status: 'idle',
              errors: {},
            },
          },
        };
      }
      return {
        ...state,
        add: {
          ...state.add,
          state: {
            step: 'code',
            identifier: action.identifier,
            strategy: action.strategy,
            code: '',
            status: 'idle',
            errors: {},
            resend: IDLE_RESEND,
          },
        },
      };
    }
    case 'add.code':
      if (state.add?.state.step !== 'code') {
        return state;
      }
      return {
        ...state,
        add: { ...state.add, state: { ...state.add.state, code: action.code, status: 'idle', errors: {} } },
      };
    case 'add.codeStatus':
      if (state.add?.state.step !== 'code') {
        return state;
      }
      return {
        ...state,
        add: {
          ...state.add,
          state: {
            ...state.add.state,
            status: action.status,
            code: action.status === 'error' ? '' : state.add.state.code,
            errors: action.message ? { field: action.message } : {},
          },
        },
      };
    case 'add.resend': {
      if (state.add?.state.step !== 'code' && state.add?.state.step !== 'link') {
        return state;
      }
      const next = { isResending: action.isResending, secondsRemaining: action.cooldown ?? 0 };
      return { ...state, add: { ...state.add, state: { ...state.add.state, resend: next } } };
    }
    case 'add.tick': {
      if (state.add?.state.step !== 'code' && state.add?.state.step !== 'link') {
        return state;
      }
      const { resend } = state.add.state;
      if (resend.secondsRemaining <= 0) {
        return state;
      }
      return {
        ...state,
        add: {
          ...state.add,
          state: { ...state.add.state, resend: { ...resend, secondsRemaining: resend.secondsRemaining - 1 } },
        },
      };
    }
    case 'add.linkOutcome':
      if (state.add?.state.step !== 'link') {
        return state;
      }
      return { ...state, add: { ...state.add, state: { ...state.add.state, outcome: action.outcome } } };
    case 'add.ssoStatus':
      if (state.add?.state.step !== 'sso') {
        return state;
      }
      return {
        ...state,
        add: {
          ...state.add,
          state: {
            ...state.add.state,
            status: action.status,
            errors: action.message ? { form: action.message } : {},
          },
        },
      };
    case 'add.success':
      if (!state.add) {
        return state;
      }
      return { ...state, add: { ...state.add, state: { step: 'success', identifier: action.identifier } } };
    case 'add.close':
      return { ...state, add: null };
    case 'confirm.open':
      return {
        ...state,
        confirm: {
          pending: action.pending,
          state: { identifier: action.identifier, isSubmitting: false, errors: {} },
        },
      };
    case 'confirm.submitting':
      if (!state.confirm) {
        return state;
      }
      return {
        ...state,
        confirm: { ...state.confirm, state: { ...state.confirm.state, isSubmitting: true, errors: {} } },
      };
    case 'confirm.error':
      if (!state.confirm) {
        return state;
      }
      return {
        ...state,
        confirm: {
          ...state.confirm,
          state: { ...state.confirm.state, isSubmitting: false, errors: { form: action.message } },
        },
      };
    case 'confirm.close':
      return { ...state, confirm: null };
    case 'reverification.open':
      return { ...state, reverification: action.state };
    case 'reverification.value':
      if (!state.reverification) {
        return state;
      }
      return { ...state, reverification: { ...state.reverification, value: action.value, errors: {} } };
    case 'reverification.status':
      if (!state.reverification) {
        return state;
      }
      return {
        ...state,
        reverification: {
          ...state.reverification,
          status: action.status,
          value: action.status === 'error' ? '' : state.reverification.value,
          errors: action.message ? { field: action.message } : {},
        },
      };
    case 'reverification.resend':
      if (!state.reverification) {
        return state;
      }
      return {
        ...state,
        reverification: {
          ...state.reverification,
          resend: { isResending: action.isResending, secondsRemaining: 0 },
        },
      };
    case 'reverification.close':
      return { ...state, reverification: null };
    case 'edit.open': {
      const { identity } = action;
      if (action.field === 'name') {
        return {
          ...state,
          edit: {
            field: 'name',
            state: {
              firstName: identity.firstName,
              lastName: identity.lastName,
              isSubmitting: false,
              isReadOnly: action.readOnly,
              errors: {},
            },
          },
        };
      }
      if (action.field === 'username') {
        return {
          ...state,
          edit: {
            field: 'username',
            state: {
              value: identity.username,
              hasUsername: action.hasUsername,
              isSubmitting: false,
              errors: {},
            },
          },
        };
      }
      return {
        ...state,
        edit: {
          field: 'avatar',
          state: {
            previewUrl: identity.imageUrl,
            canRemove: Boolean(identity.imageUrl),
            status: 'idle',
            errors: {},
          },
        },
      };
    }
    case 'edit.name':
      if (state.edit?.field !== 'name') {
        return state;
      }
      return {
        ...state,
        edit: { field: 'name', state: { ...state.edit.state, [action.key]: action.value, errors: {} } },
      };
    case 'edit.username':
      if (state.edit?.field !== 'username') {
        return state;
      }
      return { ...state, edit: { field: 'username', state: { ...state.edit.state, value: action.value, errors: {} } } };
    case 'edit.avatarFile':
      if (state.edit?.field !== 'avatar') {
        return state;
      }
      return {
        ...state,
        edit: {
          field: 'avatar',
          state: {
            ...state.edit.state,
            fileName: action.fileName,
            previewUrl: action.previewUrl,
            errors: {},
          },
        },
      };
    case 'edit.busy': {
      if (!state.edit) {
        return state;
      }
      if (state.edit.field === 'avatar') {
        return {
          ...state,
          edit: {
            field: 'avatar',
            state: { ...state.edit.state, status: action.busy ? (action.status ?? 'uploading') : 'idle', errors: {} },
          },
        };
      }
      if (state.edit.field === 'name') {
        return {
          ...state,
          edit: { field: 'name', state: { ...state.edit.state, isSubmitting: action.busy, errors: {} } },
        };
      }
      return {
        ...state,
        edit: { field: 'username', state: { ...state.edit.state, isSubmitting: action.busy, errors: {} } },
      };
    }
    case 'edit.error': {
      if (!state.edit) {
        return state;
      }
      if (state.edit.field === 'avatar') {
        return {
          ...state,
          edit: { field: 'avatar', state: { ...state.edit.state, status: 'idle', errors: action.errors } },
        };
      }
      if (state.edit.field === 'name') {
        return {
          ...state,
          edit: { field: 'name', state: { ...state.edit.state, isSubmitting: false, errors: action.errors } },
        };
      }
      return {
        ...state,
        edit: { field: 'username', state: { ...state.edit.state, isSubmitting: false, errors: action.errors } },
      };
    }
    case 'edit.close':
      return { ...state, edit: null };
    case 'identity.set':
      return { ...state, identity: { ...state.identity, ...action.identity } };
    case 'contacts.add':
      return updateContacts(state, action.kind, records => [...records, action.record]);
    case 'contacts.remove':
      return updateContacts(state, action.kind, records => records.filter(record => record.id !== action.id));
    case 'contacts.setPrimary':
      return updateContacts(state, action.kind, records =>
        records.map(record => ({ ...record, isDefault: record.id === action.id })),
      );
  }
}

export interface UseAccountSectionFlowOptions {
  config?: Partial<AccountSectionFlowConfig>;
  initialEmails?: ContactRecord[];
  initialPhones?: ContactRecord[];
  initialIdentity?: ProfileIdentity;
}

const EMPTY_IDENTITY: ProfileIdentity = { firstName: '', lastName: '', username: '' };

export function useAccountSectionFlow({
  config,
  initialEmails = [],
  initialPhones = [],
  initialIdentity = EMPTY_IDENTITY,
}: UseAccountSectionFlowOptions = {}) {
  const settings = useMemo(() => ({ ...DEFAULT_ACCOUNT_SECTION_FLOW_CONFIG, ...config }), [config]);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const initialState: FlowState = {
    add: null,
    edit: null,
    identity: initialIdentity,
    confirm: null,
    reverification: null,
    emails: initialEmails,
    phones: initialPhones,
  };
  const [state, reactDispatch] = useReducer(reducer, initialState);

  /**
   * A shadow copy of the reducer state, advanced synchronously on every dispatch.
   *
   * An actor processes `send` before the next `send` is handled, so a machine reading its own
   * context always sees the latest one. `useReducer` does not: the state a callback closes over is
   * the last COMMITTED one. That gap is not theoretical here — `CodeInput` calls `onChange` and
   * then `onComplete` in the same event handler, so a submit triggered by the final digit would
   * read the code as it stood five digits ago and never match. Reading `stateRef.current` instead
   * of `state` gives the callbacks the semantics the machine will have.
   */
  const stateRef = useRef(initialState);
  const dispatch = useCallback((action: Action) => {
    stateRef.current = reducer(stateRef.current, action);
    reactDispatch(action);
  }, []);

  /**
   * Resolves once the caller's reverification challenge is answered. Held in a ref so the async
   * mutation that raised the challenge can await it and then carry on where it left off — which is
   * exactly what `useReverification` does to every mutation it wraps.
   */
  const reverificationGate = useRef<{ resolve: (ok: boolean) => void } | null>(null);

  /**
   * The element that opened the current flow, so focus can be returned to it.
   *
   * These dialogs are opened from state rather than from a `Dialog.Trigger`, and with no trigger
   * the primitive has nothing to return focus to — it lands on the body and the row you were on is
   * lost. Capturing `document.activeElement` at open time is the same thing a trigger would have
   * given us, and it is what a controller will do once the machine owns this.
   */
  const triggerRef = useRef<HTMLElement | null>(null);
  const captureTrigger = useCallback(() => {
    const active = document.activeElement;
    triggerRef.current = active instanceof HTMLElement ? active : null;
  }, []);

  const sleep = useCallback((ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)), []);

  /** Runs the reverification gate, if configured, and reports whether the caller may proceed. */
  const gate = useCallback(async () => {
    if (!settingsRef.current.requireReverification) {
      return true;
    }
    const strategy = settingsRef.current.reverificationStrategy;
    dispatch({
      type: 'reverification.open',
      state: {
        strategy,
        identifier: strategy === 'password' ? undefined : 'i••••@clerk.dev',
        value: '',
        status: 'idle',
        errors: {},
        resend: IDLE_RESEND,
      },
    });
    return new Promise<boolean>(resolve => {
      reverificationGate.current = { resolve };
    });
  }, [dispatch]);

  const resolveStrategy = useCallback((kind: ContactKind, identifier: string): ContactVerificationStrategy => {
    if (kind === 'phone') {
      return 'phone_code';
    }
    const domain = identifier.split('@')[1]?.toLowerCase() ?? '';
    if (settingsRef.current.ssoDomains.includes(domain)) {
      return 'enterprise_sso';
    }
    return settingsRef.current.emailStrategy;
  }, []);

  // Drives both resend cooldowns. One interval for the whole hook; `add.tick` is a no-op when
  // nothing is counting down.
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'add.tick' }), 1000);
    return () => clearInterval(id);
  }, [dispatch]);

  // Resolves a pending email link after its configured delay, standing in for the poll the machine
  // will own. `emailLinkResolveMs: 0` waits forever, so the waiting screen can be inspected.
  const addStep = state.add?.state.step;
  const addIdentifier = state.add?.state.step === 'link' ? state.add.state.identifier : undefined;
  const linkOutcomeSettled = state.add?.state.step === 'link' ? Boolean(state.add.state.outcome) : false;
  useEffect(() => {
    if (addStep !== 'link' || linkOutcomeSettled || !addIdentifier || settings.emailLinkResolveMs <= 0) {
      return;
    }
    const id = setTimeout(() => {
      if (settingsRef.current.emailLinkOutcome === 'verified') {
        dispatch({ type: 'contacts.add', kind: 'email', record: makeRecord(addIdentifier, true) });
        dispatch({ type: 'add.success', identifier: addIdentifier });
      } else {
        dispatch({ type: 'add.linkOutcome', outcome: settingsRef.current.emailLinkOutcome });
      }
    }, settings.emailLinkResolveMs);
    return () => clearTimeout(id);
  }, [addStep, addIdentifier, dispatch, linkOutcomeSettled, settings.emailLinkResolveMs]);

  const openAdd = useCallback(
    (kind: ContactKind) => {
      captureTrigger();
      dispatch({ type: 'add.open', kind });
    },
    [captureTrigger, dispatch],
  );
  const closeAdd = useCallback(() => {
    reverificationGate.current?.resolve(false);
    reverificationGate.current = null;
    dispatch({ type: 'reverification.close' });
    dispatch({ type: 'add.close' });
  }, [dispatch]);

  const submitIdentifier = useCallback(async () => {
    const current = stateRef.current.add;
    if (current?.state.step !== 'identifier') {
      return;
    }
    const identifier = current.state.value.trim();
    const { kind } = current;

    dispatch({ type: 'add.submitting' });
    if (!(await gate())) {
      dispatch({ type: 'add.error', errors: {} });
      return;
    }
    await sleep(settingsRef.current.latencyMs);

    if (settingsRef.current.failWithFormError) {
      dispatch({ type: 'add.error', errors: { form: 'Something went wrong. Please try again.' } });
      return;
    }
    if (kind === 'email' && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(identifier)) {
      dispatch({ type: 'add.error', errors: { field: 'Enter a valid email address.' } });
      return;
    }
    if (kind === 'phone' && identifier.replace(/\D/g, '').length < 8) {
      dispatch({ type: 'add.error', errors: { field: 'Enter a valid phone number.' } });
      return;
    }
    if (settingsRef.current.takenIdentifiers.includes(identifier.toLowerCase())) {
      dispatch({
        type: 'add.error',
        errors: { field: `That ${kind === 'email' ? 'email address' : 'phone number'} is taken. Please try another.` },
      });
      return;
    }

    const strategy = resolveStrategy(kind, identifier);
    dispatch({ type: 'add.preparing', identifier, strategy });
    // `prepareVerification`. Legacy fires this beneath an already-rendered code screen; here it
    // gets its own step so the latency is visible rather than invisible-until-it-fails.
    await sleep(settingsRef.current.latencyMs);
    dispatch({ type: 'add.verify', identifier, strategy, providerName: settingsRef.current.ssoProviderName });
  }, [dispatch, gate, resolveStrategy, sleep]);

  const submitCode = useCallback(async () => {
    const current = stateRef.current.add;
    if (current?.state.step !== 'code' || current.state.status === 'verifying') {
      return;
    }
    const { code, identifier } = current.state;
    const { kind } = current;

    dispatch({ type: 'add.codeStatus', status: 'verifying' });
    await sleep(settingsRef.current.latencyMs);

    if (code !== settingsRef.current.validCode) {
      dispatch({ type: 'add.codeStatus', status: 'error', message: 'Incorrect code. Please try again.' });
      return;
    }
    dispatch({ type: 'add.codeStatus', status: 'success' });
    dispatch({ type: 'contacts.add', kind, record: makeRecord(identifier, true) });
    // Hold on the check mark before moving on, as the legacy OTP control does.
    await sleep(600);
    dispatch({ type: 'add.success', identifier });
  }, [dispatch, sleep]);

  const resend = useCallback(async () => {
    const current = stateRef.current.add;
    if (current?.state.step !== 'code' && current?.state.step !== 'link') {
      return;
    }
    const isLink = current.state.step === 'link';
    dispatch({ type: 'add.resend', isResending: true });
    await sleep(settingsRef.current.latencyMs);
    dispatch({ type: 'add.resend', isResending: false, cooldown: isLink ? LINK_RESEND_COOLDOWN_S : 0 });
  }, [dispatch, sleep]);

  const openSsoPopup = useCallback(async () => {
    const current = stateRef.current.add;
    if (current?.state.step !== 'sso') {
      return;
    }
    const { identifier } = current.state;
    dispatch({ type: 'add.ssoStatus', status: 'awaiting_popup' });
    await sleep(settingsRef.current.latencyMs * 2);

    if (settingsRef.current.ssoFails) {
      dispatch({ type: 'add.ssoStatus', status: 'error', message: 'Verification was cancelled or failed.' });
      return;
    }
    dispatch({ type: 'contacts.add', kind: 'email', record: makeRecord(identifier, true) });
    dispatch({ type: 'add.success', identifier });
  }, [dispatch, sleep]);

  const openEdit = useCallback(
    (field: ProfileField) => {
      captureTrigger();
      const { identity } = stateRef.current;
      dispatch({
        type: 'edit.open',
        field,
        identity,
        hasUsername: Boolean(identity.username),
        // Only the name is locked by an enterprise connection; username and avatar stay editable.
        readOnly: field === 'name' && settingsRef.current.enterpriseManaged,
      });
    },
    [captureTrigger, dispatch],
  );

  const closeEdit = useCallback(() => {
    reverificationGate.current?.resolve(false);
    reverificationGate.current = null;
    dispatch({ type: 'reverification.close' });
    dispatch({ type: 'edit.close' });
  }, [dispatch]);

  const submitEdit = useCallback(async () => {
    const current = stateRef.current.edit;
    if (!current) {
      return;
    }

    if (current.field === 'name') {
      if (current.state.isReadOnly || current.state.isSubmitting) {
        return;
      }
      const { firstName, lastName } = current.state;
      dispatch({ type: 'edit.busy', busy: true });
      // `user.update({ firstName, lastName })` is NOT wrapped in `useReverification` in the legacy
      // profile page, so no gate here — unlike the username below.
      await sleep(settingsRef.current.latencyMs);

      if (settingsRef.current.failWithFormError) {
        dispatch({ type: 'edit.error', errors: { form: 'Something went wrong. Please try again.' } });
        return;
      }
      if (!firstName.trim()) {
        dispatch({ type: 'edit.error', errors: { firstName: 'Enter a first name.' } });
        return;
      }
      dispatch({ type: 'identity.set', identity: { firstName: firstName.trim(), lastName: lastName.trim() } });
      dispatch({ type: 'edit.close' });
      return;
    }

    if (current.field === 'username') {
      if (current.state.isSubmitting) {
        return;
      }
      const { value } = current.state;
      dispatch({ type: 'edit.busy', busy: true });
      // The legacy `UsernameForm` wraps its update in `useReverification`.
      if (!(await gate())) {
        dispatch({ type: 'edit.error', errors: { form: 'Verification was cancelled.' } });
        return;
      }
      await sleep(settingsRef.current.latencyMs);

      if (settingsRef.current.failWithFormError) {
        dispatch({ type: 'edit.error', errors: { form: 'Something went wrong. Please try again.' } });
        return;
      }
      const trimmed = value.trim();
      if (trimmed.length < 4) {
        dispatch({ type: 'edit.error', errors: { field: 'Username must be at least 4 characters.' } });
        return;
      }
      if (
        trimmed.toLowerCase() !== stateRef.current.identity.username.toLowerCase() &&
        settingsRef.current.takenUsernames.includes(trimmed.toLowerCase())
      ) {
        dispatch({ type: 'edit.error', errors: { field: 'That username is taken. Please try another.' } });
        return;
      }
      dispatch({ type: 'identity.set', identity: { username: trimmed } });
      dispatch({ type: 'edit.close' });
      return;
    }

    if (current.state.status !== 'idle' || !current.state.fileName) {
      return;
    }
    const nextUrl = current.state.previewUrl;
    dispatch({ type: 'edit.busy', busy: true, status: 'uploading' });
    await sleep(settingsRef.current.latencyMs);

    if (settingsRef.current.failWithFormError) {
      dispatch({ type: 'edit.error', errors: { form: 'Something went wrong. Please try again.' } });
      return;
    }
    dispatch({ type: 'identity.set', identity: { imageUrl: nextUrl } });
    dispatch({ type: 'edit.close' });
  }, [dispatch, gate, sleep]);

  /**
   * Type and size are checked before anything is sent, matching the legacy uploader — a rejected
   * file never reaches the server, so the error is local and instant regardless of latency.
   */
  const selectAvatarFile = useCallback(
    (file: File) => {
      if (!AVATAR_MIME_TYPES.includes(file.type)) {
        dispatch({ type: 'edit.error', errors: { field: 'Use a PNG, JPEG, GIF or WebP image.' } });
        return;
      }
      if (file.size > AVATAR_MAX_BYTES) {
        dispatch({ type: 'edit.error', errors: { field: 'That image is larger than 10MB.' } });
        return;
      }
      dispatch({ type: 'edit.avatarFile', fileName: file.name, previewUrl: URL.createObjectURL(file) });
    },
    [dispatch],
  );

  const removeAvatar = useCallback(async () => {
    const current = stateRef.current.edit;
    if (current?.field !== 'avatar' || current.state.status !== 'idle') {
      return;
    }
    dispatch({ type: 'edit.busy', busy: true, status: 'removing' });
    await sleep(settingsRef.current.latencyMs);

    if (settingsRef.current.failWithFormError) {
      dispatch({ type: 'edit.error', errors: { form: 'Something went wrong. Please try again.' } });
      return;
    }
    dispatch({ type: 'identity.set', identity: { imageUrl: undefined } });
    dispatch({ type: 'edit.close' });
  }, [dispatch, sleep]);

  const openConfirm = useCallback(
    (pending: PendingConfirm, identifier: string) => {
      captureTrigger();
      dispatch({ type: 'confirm.open', pending, identifier });
    },
    [captureTrigger, dispatch],
  );
  const closeConfirm = useCallback(() => {
    reverificationGate.current?.resolve(false);
    reverificationGate.current = null;
    dispatch({ type: 'reverification.close' });
    dispatch({ type: 'confirm.close' });
  }, [dispatch]);

  const submitConfirm = useCallback(async () => {
    const current = stateRef.current.confirm;
    if (!current) {
      return;
    }
    dispatch({ type: 'confirm.submitting' });
    if (!(await gate())) {
      dispatch({ type: 'confirm.error', message: 'Verification was cancelled.' });
      return;
    }
    await sleep(settingsRef.current.latencyMs);

    if (settingsRef.current.failWithFormError) {
      dispatch({ type: 'confirm.error', message: 'Something went wrong. Please try again.' });
      return;
    }
    const { pending } = current;
    if (pending.action === 'remove') {
      dispatch({ type: 'contacts.remove', kind: pending.kind, id: pending.id });
    } else {
      dispatch({ type: 'contacts.setPrimary', kind: pending.kind, id: pending.id });
    }
    dispatch({ type: 'confirm.close' });
  }, [dispatch, gate, sleep]);

  const submitReverification = useCallback(async () => {
    const current = stateRef.current.reverification;
    if (!current || current.status === 'verifying') {
      return;
    }
    dispatch({ type: 'reverification.status', status: 'verifying' });
    await sleep(settingsRef.current.latencyMs);

    const expected =
      current.strategy === 'password' ? settingsRef.current.validPassword : settingsRef.current.validCode;
    if (current.value !== expected) {
      dispatch({
        type: 'reverification.status',
        status: 'error',
        message: current.strategy === 'password' ? 'Incorrect password.' : 'Incorrect code. Please try again.',
      });
      return;
    }
    dispatch({ type: 'reverification.close' });
    reverificationGate.current?.resolve(true);
    reverificationGate.current = null;
  }, [dispatch, sleep]);

  const cancelReverification = useCallback(() => {
    dispatch({ type: 'reverification.close' });
    reverificationGate.current?.resolve(false);
    reverificationGate.current = null;
  }, [dispatch]);

  const resendReverification = useCallback(async () => {
    dispatch({ type: 'reverification.resend', isResending: true });
    await sleep(settingsRef.current.latencyMs);
    dispatch({ type: 'reverification.resend', isResending: false });
  }, [dispatch, sleep]);

  return {
    emails: state.emails,
    phones: state.phones,
    add: state.add,
    edit: state.edit,
    triggerRef,
    identity: state.identity,
    confirm: state.confirm,
    reverification: state.reverification,
    openAdd,
    closeAdd,
    setIdentifier: useCallback((value: string) => dispatch({ type: 'add.value', value }), [dispatch]),
    setCode: useCallback((code: string) => dispatch({ type: 'add.code', code }), [dispatch]),
    submitIdentifier,
    submitCode,
    resend,
    openSsoPopup,
    openEdit,
    closeEdit,
    submitEdit,
    selectAvatarFile,
    removeAvatar,
    setName: useCallback(
      (key: 'firstName' | 'lastName', value: string) => dispatch({ type: 'edit.name', key, value }),
      [dispatch],
    ),
    setUsername: useCallback((value: string) => dispatch({ type: 'edit.username', value }), [dispatch]),
    openConfirm,
    closeConfirm,
    submitConfirm,
    setReverificationValue: useCallback(
      (value: string) => dispatch({ type: 'reverification.value', value }),
      [dispatch],
    ),
    submitReverification,
    cancelReverification,
    resendReverification,
  };
}

let recordCounter = 0;
function makeRecord(value: string, isVerified: boolean): ContactRecord {
  recordCounter += 1;
  return { id: `contact_${recordCounter}`, value, isVerified };
}
