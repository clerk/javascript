import { setup } from '../machine/setup';
import type { StateConfig, Transition } from '../machine/types';

/**
 * The `activate` wizard step, ported from the legacy `steps/ActivateStep.tsx` — the terminal step.
 *
 * Only one thing is flow state: activating the connection (`setConnectionActive(id, true)`), which
 * is async and can error. The active/not-active display, the title/subtitle copy, and the Skip /
 * Done exits are NOT modelled here — `isActive` is a live injected input the view reads, and the
 * exits are a plain `exitWizard` call the view makes on the controller (no mutation).
 *
 * Legacy records its `eventFlowStepMounted('configureSSO', 'activate', …)` telemetry AFTER a
 * successful activate (with `connectionStatus: 'active'`), not on mount — so the controller fires it
 * inside the injected `activateConnection` on success, and the machine only sequences the mutation:
 *
 *   idle ──ACTIVATE──▶ activating ─(onDone)─▶ activated   (controller exits the wizard on the edge)
 *                          └─(onError)──────▶ idle + error
 *
 * `activated` is a resting state whose rising edge the controller forwards as `exitWizard()` (the
 * legacy `onExit()` after activation), mirroring the configure/test bubble. `ENTER` (from the step
 * view's mount effect) resets to `idle` on a re-mount.
 */

export interface OrganizationProfileSecurityWizardActivateContext {
  /** Live: is the connection already active? Selects the view's copy + Done-vs-Activate button (injected). */
  isActive: boolean;
  error: string | null;
  /** Activate the connection, then record the activate telemetry on success (legacy `handleActivate`). */
  activateConnection: () => Promise<void>;
}

export type OrganizationProfileSecurityWizardActivateEvent =
  /** Fired from the step view's mount effect: reset the flow to `idle` on (re-)entry. */
  | { type: 'ENTER' }
  /** The Activate button: activate the connection. */
  | { type: 'ACTIVATE' };

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileSecurityWizardActivateContext,
  OrganizationProfileSecurityWizardActivateEvent
>();

const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : 'Something went wrong. Please try again.';

/** Reset to idle on (re-)entry, clearing any prior error (legacy remounts the step fresh). */
const resetOnEnter: Transition<OrganizationProfileSecurityWizardActivateContext, { type: 'ENTER' }> = {
  target: 'idle',
  actions: assign(() => ({ error: null })),
};

type ActivateState = StateConfig<
  OrganizationProfileSecurityWizardActivateContext,
  OrganizationProfileSecurityWizardActivateEvent
>;

const idle: ActivateState = {
  on: {
    ENTER: resetOnEnter,
    ACTIVATE: { target: 'activating', actions: assign(() => ({ error: null })) },
  },
};

const activating: ActivateState = {
  invoke: fromPromise(context => context.activateConnection(), {
    onDone: { target: 'activated' },
    onError: {
      target: 'idle',
      actions: assign((_, event) => ({ error: errorMessage(event.error) })),
    },
  }),
  on: { ENTER: resetOnEnter },
};

/**
 * Activation succeeded. A resting state whose rising edge the controller forwards as `exitWizard()`
 * (legacy `onExit()`), returning the panel to the overview.
 */
const activated: ActivateState = {
  on: { ENTER: resetOnEnter },
};

export const organizationProfileSecurityWizardActivateMachine = createMachine({
  id: 'securityWizardActivate',
  initial: 'idle',
  context: {
    isActive: false,
    error: null,
    activateConnection: async () => {},
  },
  states: {
    idle,
    activating,
    activated,
  },
});
