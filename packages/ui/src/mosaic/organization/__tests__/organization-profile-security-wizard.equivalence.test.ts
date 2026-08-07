import { describe, expect, it } from 'vitest';

import {
  initialState as legacyInitialState,
  reduce as legacyReduce,
  type WizardConfig,
  type WizardEvent,
} from '@/components/ConfigureSSO/elements/Wizard/reducer';

import { createActor } from '../../machine/createActor';
import type { OrganizationProfileSecurityWizardContext } from '../organization-profile-security-wizard.machine';
import {
  organizationProfileSecurityWizardMachine,
  SECURITY_WIZARD_STEP_ORDER,
} from '../organization-profile-security-wizard.machine';

/**
 * 1:1 equivalence proof for the ConfigureSSO wizard migration.
 *
 * This drives IDENTICAL event sequences through the legacy pure reducer
 * (`components/ConfigureSSO/elements/Wizard/reducer.ts`, the "older machine" the
 * migration is modeled on) and the new Mosaic security wizard machine, and asserts
 * the resulting navigation state matches exactly — current step, direction, and
 * hasNavigated — across every reachability combination of the three gated steps.
 *
 * The legacy reducer is generic/descriptor-driven; the new machine is the
 * security-specific instance. To hold them in lockstep, a single `Reach` spec seeds
 * BOTH: the legacy step descriptors' `isReachable` closures, and the new machine's
 * connection-entity context booleans (which its reachability guards read). The
 * mapping mirrors `ConfigureSSOWizard.tsx`:
 *   configure reachable ⟺ allDomainsVerified || hasConnection
 *   test      reachable ⟺ hasMinimumConfiguration || isActive
 *   activate  reachable ⟺ hasSuccessfulTestRun || isActive
 *
 * Note on the deferred advance: the legacy *reducer* treats a blocked NEXT as a
 * pure no-op (current unchanged); the new machine PARKS it (current still
 * unchanged, but `pendingNext` flips). That matches the legacy *seam*
 * (`useWizardMachine`'s `pendingNextFrom`), not the bare reducer — so the parked
 * NEXT leaves `current`/`direction`/`hasNavigated` identical to the reducer, and
 * the parity assertions below hold. The park→recheck resolution is covered by the
 * machine's own test.
 */

interface Reach {
  configure: boolean;
  test: boolean;
  activate: boolean;
}

const legacyConfig = (reach: Reach): WizardConfig => ({
  descriptors: [
    { id: 'verify-domain' },
    { id: 'configure', isReachable: () => reach.configure },
    { id: 'test', isReachable: () => reach.test },
    { id: 'activate', isReachable: () => reach.activate },
  ],
});

const machineContext = (reach: Reach): Partial<OrganizationProfileSecurityWizardContext> => ({
  allDomainsVerified: reach.configure,
  hasMinimumConfiguration: reach.test,
  hasSuccessfulTestRun: reach.activate,
  hasConnection: false,
  isActive: false,
});

interface NavState {
  current: string;
  direction: 1 | -1 | 0;
  hasNavigated: boolean;
}

const runLegacy = (reach: Reach, events: WizardEvent[]): NavState[] => {
  const config = legacyConfig(reach);
  let state = legacyInitialState(config);
  const trace: NavState[] = [{ current: state.current, direction: state.direction, hasNavigated: state.hasNavigated }];
  for (const event of events) {
    state = legacyReduce(state, event, config);
    trace.push({ current: state.current, direction: state.direction, hasNavigated: state.hasNavigated });
  }
  return trace;
};

const runMachine = (reach: Reach, events: WizardEvent[]): NavState[] => {
  const actor = createActor(organizationProfileSecurityWizardMachine, { context: machineContext(reach) });
  actor.start();
  const read = (): NavState => {
    const snap = actor.getSnapshot();
    return { current: snap.value, direction: snap.context.direction, hasNavigated: snap.context.hasNavigated };
  };
  const trace: NavState[] = [read()];
  for (const event of events) {
    actor.send(event);
    trace.push(read());
  }
  return trace;
};

/** All 8 reachability combinations of the three gated steps. */
const ALL_REACH: Reach[] = [false, true].flatMap(configure =>
  [false, true].flatMap(test => [false, true].map(activate => ({ configure, test, activate }))),
);

/** Representative event sequences: linear, backtracking, and jumping. */
const SEQUENCES: { name: string; events: WizardEvent[] }[] = [
  { name: 'all NEXT', events: [{ type: 'NEXT' }, { type: 'NEXT' }, { type: 'NEXT' }, { type: 'NEXT' }] },
  { name: 'all PREV', events: [{ type: 'PREV' }, { type: 'PREV' }, { type: 'PREV' }, { type: 'PREV' }] },
  {
    name: 'next then back',
    events: [{ type: 'NEXT' }, { type: 'NEXT' }, { type: 'PREV' }, { type: 'NEXT' }],
  },
  {
    name: 'goto forward then backward',
    events: [
      { type: 'GOTO', step: 'activate' },
      { type: 'GOTO', step: 'verify-domain' },
      { type: 'GOTO', step: 'test' },
    ],
  },
  {
    name: 'blocked next then goto then prev',
    events: [{ type: 'NEXT' }, { type: 'GOTO', step: 'test' }, { type: 'PREV' }, { type: 'GOTO', step: 'nope' }],
  },
];

describe('security wizard — 1:1 equivalence with the legacy reducer', () => {
  it('derives the same initial step for every reachability combination', () => {
    for (const reach of ALL_REACH) {
      const legacyInitial = legacyInitialState(legacyConfig(reach)).current;
      const machineInitial = runMachine(reach, [])[0].current;
      expect(machineInitial, JSON.stringify(reach)).toBe(legacyInitial);
    }
  });

  it('produces identical navigation traces across every reach × sequence', () => {
    for (const reach of ALL_REACH) {
      for (const { name, events } of SEQUENCES) {
        const legacy = runLegacy(reach, events);
        const machine = runMachine(reach, events);
        expect(machine, `${name} @ ${JSON.stringify(reach)}`).toEqual(legacy);
      }
    }
  });

  it('covers the full declared step set', () => {
    expect(SECURITY_WIZARD_STEP_ORDER).toEqual(['verify-domain', 'configure', 'test', 'activate']);
  });
});
