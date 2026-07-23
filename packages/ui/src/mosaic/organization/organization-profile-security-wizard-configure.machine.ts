import type { UpdateOrganizationEnterpriseConnectionParams } from '@clerk/shared/types';

import type { ProviderType } from '@/components/ConfigureSSO/types';

import { setup } from '../machine/setup';
import type { StateConfig, Transition } from '../machine/types';

/**
 * The `configure` wizard step, ported from the legacy nested `<Wizard>` tree
 * (`steps/ConfigureStep/index.tsx` + `steps/SelectProviderStep.tsx` +
 * `steps/ConfigureStep/saml/*`).
 *
 * ── What this collapses, and why it is still 1:1 on FLOW ──────────────────────
 * Legacy nests THREE generic `<Wizard>`s: the outer 4-step wizard, a MIDDLE
 * `configure` wizard (`select-provider → configure-provider`, the latter guarded
 * on `c.hasConnection`), and an INNER per-provider SAML wizard whose terminal
 * `goNext` BUBBLES up two levels to advance the outer wizard to `test`
 * (`useWizardMachine.ts:169-176`). In Mosaic the controller owns every actor, so
 * the middle + inner levels collapse into THIS single machine and the bubble
 * becomes "the controller sends `NEXT` to the outer wizard actor" — no
 * cross-machine plumbing, and the outer wizard's own `pendingNext` deferral
 * (`organization-profile-security-wizard.machine.ts`) still absorbs the
 * configure→test revalidation race exactly as before.
 *
 *   selecting ──CREATE──▶ creatingConnection ─┐
 *      │   ╲──CHANGE──▶ changingProvider ──────┤ (onDone)
 *      │    ╲─────────────SKIP─────────────────┴──▶ configuring ⇄ (inner SAML steps)
 *      │                                                 │  SAVE ▶ saving
 *      └◀────PREV_INNER (at inner step 0)                │            │ onDone
 *                                                        │            ├─(submit is terminal)─▶ bubblingNext
 *                                                        │            └─(submit is mid-flow)──▶ configuring (stepIndex+1)
 *                                                        └─ terminal non-submit Continue / first Previous
 *                                                           are forwarded to the OUTER wizard by the view.
 *
 * ── The provider asymmetry this must preserve ────────────────────────────────
 * `updateConnection` (the SAML save) is the TERMINAL inner step for Okta / Custom
 * / Microsoft, but a MID-FLOW step for Google (index 1 of 5, followed by
 * service-provider → attribute-mapping → configure-user-access). Modelling the
 * save as "advance one inner slot" (not "bubble on save") makes both cases fall
 * out with no per-provider branching: a terminal save advances off the end →
 * `bubblingNext` (bubble to outer); a mid-flow save advances to the next inner
 * step, and the later plain terminal step bubbles then. `providerSteps` /
 * `submitIndex` are the only per-provider inputs, and the controller derives both
 * from the entity's `provider`.
 *
 * ── Ephemeral (stays view `useState`, deliberately NOT modelled) ──────────────
 * The selected radio value, the per-step submit spinners' local copies, the
 * ChangeProviderDialog open/from state, and every SAML form field + mode +
 * certificate File. The machine only sees the resulting event (`CREATE` /
 * `CHANGE` / `SKIP` / `NEXT_INNER` / `PREV_INNER` / `SAVE`).
 *
 * ── Re-seat semantics ────────────────────────────────────────────────────────
 *  - Legacy re-mounts the whole `configure` subtree whenever the outer wizard
 *    (re-)enters the step, so the inner SAML wizard always seeds at its first step
 *    (`initialStepId={STEPS[0]}`) and forward entry forces `select-provider`
 *    (`ConfigureStep/index.tsx:34`). The controller fires `ENTER { forward }` from
 *    the step view's mount effect (which unmounts/remounts on the same lifecycle),
 *    which re-seats here identically.
 *  - Legacy re-seats the middle wizard to `select-provider` when the
 *    `configure-provider` guard breaks mid-flow (a footer Reset deleted the
 *    connection — `useWizardMachine.ts:99-121`). Here `configuring` / `saving` /
 *    `bubblingNext` all carry the `hasConnection` entry guard, so the controller's
 *    `recheck()` after a delete re-seats to `selecting`.
 */

/** The `saml` sub-object of the update params — the payload the SAML submit step builds and sends. */
type SamlConfigurationPayload = NonNullable<UpdateOrganizationEnterpriseConnectionParams['saml']>;

/** The single inner step across all providers that submits `updateConnection` (`saml/*` metadata step). */
export const SAML_SUBMIT_STEP_ID = 'identity-provider-metadata';

/**
 * The ordered inner SAML step ids per provider — ported verbatim from the four
 * `steps/ConfigureStep/saml/Saml*ConfigureSteps.tsx` step arrays. Okta / Custom / Microsoft submit
 * at their terminal step; Google submits at `identity-provider-metadata` (index 1 of 5). The
 * controller feeds the selected provider's list (and the derived submit index) into the machine.
 */
export const CONFIGURE_PROVIDER_STEPS: Record<ProviderType, string[]> = {
  saml_okta: ['create-app', 'attribute-mapping', 'assign-users', 'identity-provider-metadata'],
  saml_custom: ['create-app', 'attribute-mapping', 'assign-users', 'identity-provider-metadata'],
  saml_google: [
    'create-app',
    'identity-provider-metadata',
    'service-provider',
    'attribute-mapping',
    'configure-user-access',
  ],
  saml_microsoft: ['create-app', 'service-provider', 'attribute-mapping', 'identity-provider-metadata'],
};

export interface OrganizationProfileSecurityWizardConfigureContext {
  /** Ordered inner SAML step ids for the current provider; controller-derived from the entity. */
  providerSteps: string[];
  /** Index within `providerSteps` of the `updateConnection` submit step; `-1` when there is none yet. */
  submitIndex: number;
  /** Current inner step position within `providerSteps`. */
  stepIndex: number;
  /** `1` forward / `-1` back / `0` reset — inner step animation only (mirrors the wizard's `direction`). */
  direction: 1 | -1 | 0;
  /** Live: does a connection exist? Gates `configuring`/`saving`/`bubblingNext`; `recheck()` re-seats when it breaks. */
  hasConnection: boolean;
  error: string | null;
  /**
   * A create/change advance that `onDone` could not commit because the fresh `hasConnection` had
   * not been reseated yet — resolved by the next `recheck()`. Mirrors the outer wizard's `pendingNext`.
   */
  pendingEnter: boolean;
  /** Provider being created/changed, stashed off the triggering event so the invoke can read it from context. */
  pendingProvider: ProviderType | null;
  /** SAML payload being saved, stashed off `SAVE` so the `saving` invoke can read it from context. */
  pendingPayload: SamlConfigurationPayload;
  createConnection: (provider: ProviderType) => Promise<void>;
  changeProvider: (provider: ProviderType) => Promise<void>;
  updateConnection: (payload: SamlConfigurationPayload) => Promise<void>;
}

export type OrganizationProfileSecurityWizardConfigureEvent =
  /** Fired from the step view's mount effect: reset the inner flow (forward entry forces `select-provider`). */
  | { type: 'ENTER'; forward: boolean }
  /** Select-provider Continue, no existing connection → create it. */
  | { type: 'CREATE'; provider: ProviderType }
  /** Select-provider Continue, existing connection + different provider (dialog confirmed) → swap it. */
  | { type: 'CHANGE'; provider: ProviderType }
  /** Select-provider Continue, existing connection + same provider → straight into the SAML sub-flow. */
  | { type: 'SKIP' }
  /** Advance one inner SAML step (non-submit, non-terminal). */
  | { type: 'NEXT_INNER' }
  /** Back one inner SAML step; from the first inner step, back to select-provider. */
  | { type: 'PREV_INNER' }
  /** Submit the SAML config for the current step. */
  | { type: 'SAVE'; payload: SamlConfigurationPayload };

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileSecurityWizardConfigureContext,
  OrganizationProfileSecurityWizardConfigureEvent
>();

const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : 'Something went wrong. Please try again.';

/** Reset the inner flow on (re-)entry — matches the legacy subtree remounting fresh. */
const resetInner = assign(() => ({ stepIndex: 0, direction: 0 as const, error: null, pendingPayload: {} }));

/** Land on the SAML sub-flow's first step (used by both the immediate and the deferred create/change advance). */
const enterConfiguring = assign(() => ({ stepIndex: 0, direction: 1 as const, error: null, pendingEnter: false }));

/**
 * The mount-reset transition, shared by every state's `on.ENTER`. Forward entry always
 * forces `selecting` (legacy `initialStepId = direction === 1 ? 'select-provider' : undefined`);
 * otherwise seed the furthest-reachable step (`configuring` iff a connection already exists).
 */
const enterTransition: Transition<
  OrganizationProfileSecurityWizardConfigureContext,
  Extract<OrganizationProfileSecurityWizardConfigureEvent, { type: 'ENTER' }>
> = [
  { target: 'selecting', guard: (_, event) => event.forward, actions: resetInner },
  { target: 'configuring', guard: (context, event) => !event.forward && context.hasConnection, actions: resetInner },
  { target: 'selecting', actions: resetInner },
];

type ConfigureState = StateConfig<
  OrganizationProfileSecurityWizardConfigureContext,
  OrganizationProfileSecurityWizardConfigureEvent
>;

const selecting: ConfigureState = {
  on: {
    ENTER: enterTransition,
    CREATE: {
      target: 'creatingConnection',
      actions: assign((_, event) => ({ pendingProvider: event.provider, error: null, pendingEnter: false })),
    },
    CHANGE: {
      target: 'changingProvider',
      actions: assign((_, event) => ({ pendingProvider: event.provider, error: null, pendingEnter: false })),
    },
    // Same provider, connection already present: no mutation, straight into the SAML sub-flow.
    SKIP: {
      target: 'configuring',
      guard: context => context.hasConnection,
      actions: assign(() => ({ stepIndex: 0, direction: 1 as const, error: null })),
    },
  },
};

// `createConnection` resolves before the controller has reseated the fresh `hasConnection` into
// context, so the `configuring` entry guard is still stale-false at `onDone` and the advance is
// blocked — the legacy MIDDLE wizard hit the same race and parked it (`useWizardMachine.ts`). The
// blocked `onDone` parks `pendingEnter`; the actor rests in the invoke state (Continue spinner
// still on, matching legacy's held button) and the `always` completes the advance the moment the
// controller's `recheck()` (after the revalidate lands) sees `hasConnection`. When the cache is
// already warm (`changeProvider`, whose connection never drops), `onDone` advances immediately.
// The `always` is `pendingEnter`-gated so it never fires on ENTRY (before the mutation runs) —
// otherwise a change, where `hasConnection` is already true, would skip the mutation entirely.
const parkEnter = assign(() => ({ pendingEnter: true }));

const creatingConnection: ConfigureState = {
  always: {
    target: 'configuring',
    guard: context => context.pendingEnter && context.hasConnection,
    actions: enterConfiguring,
  },
  invoke: fromPromise(
    context => (context.pendingProvider ? context.createConnection(context.pendingProvider) : Promise.resolve()),
    {
      onDone: [
        { target: 'configuring', guard: context => context.hasConnection, actions: enterConfiguring },
        { actions: parkEnter },
      ],
      onError: {
        target: 'selecting',
        actions: assign((_, event) => ({ error: errorMessage(event.error) })),
      },
    },
  ),
  on: { ENTER: enterTransition },
};

const changingProvider: ConfigureState = {
  always: {
    target: 'configuring',
    guard: context => context.pendingEnter && context.hasConnection,
    actions: enterConfiguring,
  },
  invoke: fromPromise(
    context => (context.pendingProvider ? context.changeProvider(context.pendingProvider) : Promise.resolve()),
    {
      onDone: [
        { target: 'configuring', guard: context => context.hasConnection, actions: enterConfiguring },
        { actions: parkEnter },
      ],
      onError: {
        target: 'selecting',
        actions: assign((_, event) => ({ error: errorMessage(event.error) })),
      },
    },
  ),
  on: { ENTER: enterTransition },
};

const configuring: ConfigureState = {
  guard: context => context.hasConnection,
  on: {
    ENTER: enterTransition,
    // Internal (no target): the view only sends NEXT_INNER for a non-terminal, non-submit
    // step, so there is always a slot ahead; the guard is defense in depth.
    NEXT_INNER: {
      guard: context => context.stepIndex < context.providerSteps.length - 1,
      actions: assign(context => ({ stepIndex: context.stepIndex + 1, direction: 1 as const })),
    },
    PREV_INNER: [
      {
        guard: context => context.stepIndex > 0,
        actions: assign(context => ({ stepIndex: context.stepIndex - 1, direction: -1 as const })),
      },
      // First inner step: back out to select-provider (legacy inner-first `goPrev` bubbles to the
      // middle wizard, which steps configure-provider → select-provider).
      { target: 'selecting', actions: assign(() => ({ direction: -1 as const })) },
    ],
    SAVE: {
      target: 'saving',
      actions: assign((_, event) => ({ pendingPayload: event.payload, error: null })),
    },
  },
};

const saving: ConfigureState = {
  guard: context => context.hasConnection,
  invoke: fromPromise(context => context.updateConnection(context.pendingPayload), {
    onDone: [
      // Terminal submit (Okta / Custom / Microsoft): advancing off the end is the bubble to `test`.
      { target: 'bubblingNext', guard: context => context.submitIndex === context.providerSteps.length - 1 },
      // Mid-flow submit (Google): advance to the next inner step within this wizard.
      {
        target: 'configuring',
        actions: assign(context => ({ stepIndex: context.submitIndex + 1, direction: 1 as const, pendingPayload: {} })),
      },
    ],
    onError: {
      target: 'configuring',
      actions: assign((_, event) => ({ error: errorMessage(event.error), pendingPayload: {} })),
    },
  }),
  on: { ENTER: enterTransition },
};

/**
 * Terminal SAML save succeeded and the inner flow is complete. A resting state that keeps the
 * Continue spinner on (the view renders it identically to the terminal step) while the controller
 * forwards a single `NEXT` to the OUTER wizard on the rising edge into this state. The outer
 * wizard parks that advance (its `pendingNext`) until the `updateConnection` revalidate lands and
 * re-seats it to `test`, unmounting this step — so there is no idle flash on the shared card,
 * matching the legacy "do NOT reset the button loading on success" behaviour.
 */
const bubblingNext: ConfigureState = {
  guard: context => context.hasConnection,
  on: { ENTER: enterTransition },
};

export const organizationProfileSecurityWizardConfigureMachine = createMachine({
  id: 'securityWizardConfigure',
  // Corrected on mount by ENTER; this covers the pre-ENTER window (e.g. a resume with a connection).
  initial: context => (context.hasConnection ? 'configuring' : 'selecting'),
  context: {
    providerSteps: [],
    submitIndex: -1,
    stepIndex: 0,
    direction: 0,
    hasConnection: false,
    error: null,
    pendingEnter: false,
    pendingProvider: null,
    pendingPayload: {},
    createConnection: async () => {},
    changeProvider: async () => {},
    updateConnection: async () => {},
  },
  states: {
    selecting,
    creatingConnection,
    changingProvider,
    configuring,
    saving,
    bubblingNext,
  },
});
