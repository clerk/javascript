import type { StateConfig } from '../machine/types';
import { setup } from '../machine/setup';

/**
 * The ConfigureSSO wizard flow, ported 1:1 from the legacy hand-built machine
 * (`components/ConfigureSSO/elements/Wizard/reducer.ts` + `useWizardMachine.ts`)
 * onto the Mosaic machine library. The four steps and their reachability /
 * completion predicates come straight from `ConfigureSSOWizard.tsx:21-44`:
 *
 *   verify-domain → configure → test → activate
 *
 * Navigation is sequential and entry-guard-gated (NEXT/PREV one slot, GOTO by id),
 * and the initial step is the furthest contiguously-reachable one — identical to
 * `reducer.ts` `initialState`. Every blocked/out-of-bounds transition is a true
 * no-op (same snapshot ref, no notify), which the view uses for terminal/first
 * detection exactly as the legacy seam did.
 *
 * ── What the legacy React seam needed, and where it goes here ──────────────────
 *   - `configRef`/`stateRef` render mirrors → gone; the actor IS the live state.
 *   - render-phase re-seat clamp (a step's guard broke) → `actor.recheck()`
 *     (createActor re-seats to the resolved initial when the current entry guard
 *     fails). The controller calls `recheck()` when the connection/domain data
 *     changes.
 *   - `pendingNextFrom` deferred advance → the `pendingNext` context flag + an
 *     `always` transition (below). This is NOT a React artifact: a submit-then-
 *     advance handler (`await createConnection(); send(NEXT)`) resolves before the
 *     controller has reseated the fresh connection booleans into context, so the
 *     NEXT sees a stale, still-closed guard. Rather than no-op ("click twice"), the
 *     NEXT parks `pendingNext = true`; when the awaited revalidate lands, the
 *     controller reseats context and calls `recheck()`, which re-runs the step's
 *     `always` and completes the parked advance. An explicit PREV/GOTO abandons it.
 *
 * Reachability guards read live booleans from CONTEXT (not descriptor closures) so
 * `useMachine`'s per-render context reseat keeps them current; the controller
 * injects `allDomainsVerified` / `hasConnection` / `hasMinimumConfiguration` /
 * `isActive` / `hasSuccessfulTestRun` from the `OrganizationEnterpriseConnection`
 * entity.
 */
export interface OrganizationProfileSecurityWizardContext {
  /** `1` forward, `-1` back, `0` jump/initial. Drives step animation only. */
  direction: 1 | -1 | 0;
  /** Latched true on the first navigation; separates "on the mount step" from "navigated back to it". */
  hasNavigated: boolean;
  /** A NEXT that was blocked by a not-yet-open guard, waiting for the awaited revalidate + recheck. */
  pendingNext: boolean;
  // Live reachability inputs, reseated by the controller each render:
  allDomainsVerified: boolean;
  hasConnection: boolean;
  hasMinimumConfiguration: boolean;
  isActive: boolean;
  hasSuccessfulTestRun: boolean;
}

export type OrganizationProfileSecurityWizardEvent =
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'GOTO'; step: string };

export type SecurityWizardStepId = 'verify-domain' | 'configure' | 'test' | 'activate';

/** Declaration order — the basis for sequential NEXT/PREV and the furthest-reachable initial. */
export const SECURITY_WIZARD_STEP_ORDER: SecurityWizardStepId[] = ['verify-domain', 'configure', 'test', 'activate'];

/** Breadcrumb labels, 1:1 with the legacy `ConfigureSSOWizard.tsx` step descriptors. */
export const SECURITY_WIZARD_STEP_LABELS: Record<SecurityWizardStepId, string> = {
  'verify-domain': 'Domains',
  configure: 'Connection',
  test: 'Test',
  activate: 'Activate',
};

/**
 * "Is this step's work finished?" — the completion predicate per step, ported from the
 * legacy descriptors' `isComplete` (`ConfigureSSOWizard.tsx`). Drives the breadcrumb tick;
 * position-independent so a finished step stays ticked after a back-nav.
 */
export const isSecurityWizardStepComplete = (
  step: SecurityWizardStepId,
  ctx: OrganizationProfileSecurityWizardContext,
): boolean => {
  switch (step) {
    case 'verify-domain':
      return ctx.allDomainsVerified;
    case 'configure':
      return ctx.hasMinimumConfiguration || ctx.isActive;
    case 'test':
      return ctx.hasSuccessfulTestRun || ctx.isActive;
    case 'activate':
      return ctx.isActive;
  }
};

/**
 * "May navigation land on this step right now?" — the entry precondition per step,
 * ported from `ConfigureSSOWizard.tsx` `isReachable`. `verify-domain` is the entry
 * step (no precondition).
 */
export const isSecurityWizardStepReachable = (
  step: SecurityWizardStepId,
  ctx: OrganizationProfileSecurityWizardContext,
): boolean => {
  switch (step) {
    case 'verify-domain':
      return true;
    case 'configure':
      return ctx.allDomainsVerified || ctx.hasConnection;
    case 'test':
      return ctx.hasMinimumConfiguration || ctx.isActive;
    case 'activate':
      return ctx.hasSuccessfulTestRun || ctx.isActive;
  }
};

const { createMachine, assign } = setup<
  OrganizationProfileSecurityWizardContext,
  OrganizationProfileSecurityWizardEvent
>();

/** Furthest step reachable by a contiguous run of holding guards from the first (mirrors `initialState`). */
const furthestReachable = (ctx: OrganizationProfileSecurityWizardContext): SecurityWizardStepId => {
  let i = 0;
  while (
    i + 1 < SECURITY_WIZARD_STEP_ORDER.length &&
    isSecurityWizardStepReachable(SECURITY_WIZARD_STEP_ORDER[i + 1], ctx)
  ) {
    i++;
  }
  return SECURITY_WIZARD_STEP_ORDER[i];
};

const navigated = (direction: 1 | -1 | 0) => assign(() => ({ direction, hasNavigated: true, pendingNext: false }));

/** Park a blocked forward advance so the next `recheck()` (after data lands) can complete it. */
const parkNext = assign(() => ({ pendingNext: true }));

const states: Record<
  string,
  StateConfig<OrganizationProfileSecurityWizardContext, OrganizationProfileSecurityWizardEvent, SecurityWizardStepId>
> = {};

SECURITY_WIZARD_STEP_ORDER.forEach((step, index) => {
  const nextId = SECURITY_WIZARD_STEP_ORDER[index + 1];
  const prevId = SECURITY_WIZARD_STEP_ORDER[index - 1];

  states[step] = {
    // Entry guard: gates every transition landing here + drives recheck re-seat.
    // `verify-domain` is the entry step, so it stays open (undefined guard).
    guard: step === 'verify-domain' ? undefined : ctx => isSecurityWizardStepReachable(step, ctx),
    // A parked NEXT resolves the moment the next step's guard opens (on recheck).
    always: nextId
      ? {
          target: nextId,
          guard: ctx => ctx.pendingNext && isSecurityWizardStepReachable(nextId, ctx),
          actions: navigated(1),
        }
      : undefined,
    on: {
      ...(nextId
        ? {
            // First arm advances when the next guard holds; otherwise the second
            // arm parks the advance (an internal transition — stays put).
            NEXT: [
              { target: nextId, guard: ctx => isSecurityWizardStepReachable(nextId, ctx), actions: navigated(1) },
              { actions: parkNext },
            ],
          }
        : {}),
      ...(prevId
        ? {
            PREV: { target: prevId, guard: ctx => isSecurityWizardStepReachable(prevId, ctx), actions: navigated(-1) },
          }
        : {}),
      // One GOTO candidate per OTHER step; the first matching `event.step` wins,
      // then the target's entry guard gates landing. Any GOTO clears a parked NEXT.
      GOTO: SECURITY_WIZARD_STEP_ORDER.filter(target => target !== step).map(target => ({
        target,
        guard: (_ctx: OrganizationProfileSecurityWizardContext, event: OrganizationProfileSecurityWizardEvent) =>
          event.type === 'GOTO' && event.step === target,
        actions: navigated(0),
      })),
    },
  };
});

export const organizationProfileSecurityWizardMachine = createMachine({
  id: 'securityWizard',
  initial: furthestReachable,
  context: {
    direction: 0,
    hasNavigated: false,
    pendingNext: false,
    allDomainsVerified: false,
    hasConnection: false,
    hasMinimumConfiguration: false,
    isActive: false,
    hasSuccessfulTestRun: false,
  },
  states,
});
