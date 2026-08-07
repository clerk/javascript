import { setup } from '../machine/setup';
import type { StateConfig, Transition } from '../machine/types';

/**
 * The `test` wizard step, ported from the legacy `steps/TestConfigurationStep.tsx`.
 *
 * ── What this models (flow) vs what stays out (ephemeral / hook) ──────────────
 * Only the two async, error-bearing user actions are flow state:
 *
 *   1. **Create a test run** (the "Open test URL" button). The injected
 *      `createTestRun` reproduces the legacy side-effect chain 1:1 — create the
 *      run, reset the list to page 1, refetch the list with polling ARMED
 *      (`refresh({ armPolling: true })`), then open the returned URL in a new tab.
 *      That ordering + the `armPolling` intent live in the controller's injected
 *      function; the machine only sequences idle → creatingRun → idle.
 *
 *   2. **Continue** (`revalidateHasSuccessfulTestRun` then advance). A fast path
 *      when a successful run is already known (`hasSuccessfulTestRun`), otherwise
 *      a fresh success-probe revalidation whose resolved boolean decides between
 *      advancing and surfacing the no-successful-run message — mirroring
 *      `ContinueTestSsoStepButton.handleContinue`, which gates on the FRESH
 *      answer, not the render-time prop, so a run completed in another tab is
 *      picked up on demand.
 *
 * Everything else on the legacy step is ephemeral view state or hook-owned data,
 * deliberately NOT modelled here: the results table rows / pagination / polling
 * (owned by `useEnterpriseConnectionTestRuns`, threaded through the controller),
 * the "Refresh logs" one-shot refetch (a direct hook call that must NOT arm
 * polling — the distinction the plan calls out), the selected-run drawer, and the
 * per-button spinners' local copies.
 *
 * ── The parent bubble ─────────────────────────────────────────────────────────
 * Like the configure step, a successful Continue cannot reach the outer wizard
 * from here, so the machine rests in `bubblingNext`; the controller forwards a
 * single outer `NEXT` on the rising edge into that state. The outer wizard parks
 * that advance (its `pendingNext`) until the revalidated `hasSuccessfulTestRun`
 * re-seats it to `activate`, unmounting this step. `ENTER` (fired from the step
 * view's mount effect) resets the flow to `idle` on a re-mount.
 */

export interface OrganizationProfileSecurityWizardTestContext {
  /** Live: is a successful run already known? The Continue fast-path gate (injected). */
  hasSuccessfulTestRun: boolean;
  error: string | null;
  /** The message shown when Continue is pressed with no successful run (injected copy). */
  noSuccessfulRunMessage: string;
  /** Create a run, reset+arm-poll the list, then open the test URL (legacy `handleTestRunCreated` + `window.open`). */
  createTestRun: () => Promise<void>;
  /** Revalidate ONLY the success probe; resolves with the fresh answer (never arms polling). */
  revalidateHasSuccessfulTestRun: () => Promise<boolean>;
}

export type OrganizationProfileSecurityWizardTestEvent =
  /** Fired from the step view's mount effect: reset the flow to `idle` on (re-)entry. */
  | { type: 'ENTER' }
  /** "Open test URL": create a run and open it. */
  | { type: 'CREATE_RUN' }
  /** Footer Continue: advance if a successful run exists (or is found on revalidation). */
  | { type: 'CONTINUE' };

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileSecurityWizardTestContext,
  OrganizationProfileSecurityWizardTestEvent
>();

const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : 'Something went wrong. Please try again.';

/** Reset to idle on (re-)entry, clearing any prior error (legacy remounts the step fresh). */
const resetOnEnter: Transition<OrganizationProfileSecurityWizardTestContext, { type: 'ENTER' }> = {
  target: 'idle',
  actions: assign(() => ({ error: null })),
};

type TestState = StateConfig<OrganizationProfileSecurityWizardTestContext, OrganizationProfileSecurityWizardTestEvent>;

const idle: TestState = {
  on: {
    ENTER: resetOnEnter,
    CREATE_RUN: { target: 'creatingRun' },
    // Fast path: a known-successful run advances immediately (legacy `advance()` clears the error
    // first). Otherwise revalidate the success probe and decide on the fresh answer.
    CONTINUE: [
      {
        target: 'bubblingNext',
        guard: context => context.hasSuccessfulTestRun,
        actions: assign(() => ({ error: null })),
      },
      { target: 'validating' },
    ],
  },
};

const creatingRun: TestState = {
  invoke: fromPromise(context => context.createTestRun(), {
    // Legacy leaves the shared card error untouched on success (only Continue's `advance()` clears it).
    onDone: { target: 'idle' },
    onError: {
      target: 'idle',
      actions: assign((_, event) => ({ error: errorMessage(event.error) })),
    },
  }),
  on: { ENTER: resetOnEnter },
};

const validating: TestState = {
  invoke: fromPromise(context => context.revalidateHasSuccessfulTestRun(), {
    onDone: [
      // Fresh probe found a successful run → advance (clearing the error, as legacy `advance()` does).
      { target: 'bubblingNext', guard: (_, event) => event.output, actions: assign(() => ({ error: null })) },
      // Genuinely no successful run → stay put and surface the inline message (legacy `error__noSuccessfulTestRun`).
      { target: 'idle', actions: assign(context => ({ error: context.noSuccessfulRunMessage })) },
    ],
    onError: {
      target: 'idle',
      actions: assign((_, event) => ({ error: errorMessage(event.error) })),
    },
  }),
  on: { ENTER: resetOnEnter },
};

/**
 * Continue succeeded and the step is complete. A resting state whose rising edge the controller
 * forwards as a single outer `NEXT`; the outer wizard parks it (its `pendingNext`) until the
 * revalidated `hasSuccessfulTestRun` re-seats it to `activate`, unmounting this step.
 */
const bubblingNext: TestState = {
  on: { ENTER: resetOnEnter },
};

export const organizationProfileSecurityWizardTestMachine = createMachine({
  id: 'securityWizardTest',
  initial: 'idle',
  context: {
    hasSuccessfulTestRun: false,
    error: null,
    noSuccessfulRunMessage: '',
    createTestRun: async () => {},
    revalidateHasSuccessfulTestRun: async () => false,
  },
  states: {
    idle,
    creatingRun,
    validating,
    bubblingNext,
  },
});
