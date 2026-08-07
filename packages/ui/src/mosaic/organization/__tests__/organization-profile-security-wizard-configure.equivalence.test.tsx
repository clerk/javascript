import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WizardContextValue } from '@/components/ConfigureSSO/elements/Wizard/types';
import { useWizardMachine } from '@/components/ConfigureSSO/elements/Wizard/useWizardMachine';
import type { ProviderType } from '@/components/ConfigureSSO/types';

import { createActor } from '../../machine/createActor';
import type { OrganizationProfileSecurityWizardConfigureContext } from '../organization-profile-security-wizard-configure.machine';
import {
  CONFIGURE_PROVIDER_STEPS,
  organizationProfileSecurityWizardConfigureMachine,
  SAML_SUBMIT_STEP_ID,
} from '../organization-profile-security-wizard-configure.machine';

/**
 * 1:1 equivalence proof for the CONFIGURE step's NESTED wizard.
 *
 * The legacy configure step nests THREE generic `<Wizard>`s: the outer 4-step wizard,
 * a MIDDLE `configure` wizard (`select-provider → configure-provider`), and an INNER
 * per-provider SAML wizard (`steps/ConfigureStep/saml/*`) whose terminal `goNext`
 * BUBBLES up through the middle wizard to advance the OUTER wizard to `test`
 * (`useWizardMachine.ts:164-176`). Each SAML wizard mounts on its first step
 * (`initialStepId={STEPS[0].id}`, e.g. `SamlOktaConfigureSteps.tsx`).
 *
 * The Mosaic migration collapses the middle + inner levels into ONE machine
 * (`organization-profile-security-wizard-configure.machine.ts`) where the "bubble"
 * is the controller forwarding a single `NEXT` to the outer wizard actor on the rising
 * edge into `bubblingNext`. This test drives the LEGACY inner `useWizardMachine` seam
 * (the oracle) and the NEW collapsed machine through the same inner walk for every
 * provider, and asserts they reach the same boundary behavior:
 *   - a terminal inner advance bubbles to the parent (legacy) ⟺ the new machine reaches
 *     its bubble point / terminal inner step at the same position;
 *   - a first-inner back-nav bubbles to `parent.goPrev` (legacy) ⟺ the new machine
 *     returns to `selecting`.
 *
 * The per-provider step arrays used to drive BOTH sides are `CONFIGURE_PROVIDER_STEPS`,
 * which a sibling test (`*-configure.machine.test.ts`) pins byte-for-byte to the legacy
 * `Saml*ConfigureSteps.tsx` arrays — so driving both from this constant is faithful.
 */

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

/** A no-op parent stub whose nav methods we can spy on (mirrors the legacy hook test). */
const makeParent = (overrides: Partial<WizardContextValue> = {}): WizardContextValue => ({
  current: 'parent',
  activeSteps: [],
  currentStep: undefined,
  currentIndex: 0,
  direction: 0,
  totalSteps: 0,
  isInitialStep: true,
  isNested: false,
  isFirstStep: true,
  isLastStep: true,
  goNext: vi.fn(),
  goPrev: vi.fn(),
  goToStep: vi.fn(),
  ...overrides,
});

/** The legacy inner SAML wizard: guard-less linear steps, seeded on the first (as the real code does). */
const renderLegacyInner = (steps: readonly string[], parent: WizardContextValue) =>
  renderHook(() =>
    useWizardMachine({
      config: { descriptors: steps.map(id => ({ id })) },
      parentWizard: parent,
      initialStepId: steps[0],
    }),
  );

/** The new collapsed configure machine, warmed with a connection and skipped into the SAML sub-flow. */
const startNewConfigure = (steps: readonly string[]) => {
  const context: Partial<OrganizationProfileSecurityWizardConfigureContext> = {
    hasConnection: true,
    providerSteps: [...steps],
    submitIndex: steps.indexOf(SAML_SUBMIT_STEP_ID),
    createConnection: async () => {},
    changeProvider: async () => {},
    updateConnection: async () => {},
  };
  const actor = createActor(organizationProfileSecurityWizardConfigureMachine, { context });
  actor.start();
  actor.send({ type: 'SKIP' });
  return actor;
};

const PROVIDERS: { name: string; provider: ProviderType }[] = [
  { name: 'okta', provider: 'saml_okta' },
  { name: 'custom', provider: 'saml_custom' },
  { name: 'microsoft', provider: 'saml_microsoft' },
  { name: 'google', provider: 'saml_google' },
];

describe.each(PROVIDERS)('configure nested seam ⟺ legacy useWizardMachine — $name', ({ provider }) => {
  const steps = CONFIGURE_PROVIDER_STEPS[provider];
  const lastIndex = steps.length - 1;
  const submitIndex = steps.indexOf(SAML_SUBMIT_STEP_ID);

  it('a terminal inner advance bubbles to the parent (legacy) and the new machine completes the inner flow at the same terminal step', async () => {
    // ── Legacy oracle: the inner SAML wizard bubbles at its terminal step ──
    const parent = makeParent();
    const { result } = renderLegacyInner(steps, parent);
    expect(result.current.current).toBe(steps[0]);
    for (let i = 0; i < lastIndex; i++) {
      await act(() => result.current.goNext());
    }
    expect(result.current.current).toBe(steps[lastIndex]);
    expect(result.current.isLastStep).toBe(true);
    // The terminal inner goNext is a scope boundary: it bubbles to the parent (the middle
    // wizard, which itself bubbles to the outer wizard → `test`).
    await act(() => result.current.goNext());
    expect(parent.goNext).toHaveBeenCalledTimes(1);

    // ── New machine: the collapsed configure machine reaches the same boundary ──
    const actor = startNewConfigure(steps);
    for (let i = 0; i < submitIndex; i++) {
      actor.send({ type: 'NEXT_INNER' });
    }
    actor.send({ type: 'SAVE', payload: {} });
    await tick();

    if (submitIndex === lastIndex) {
      // Terminal submit (Okta / Custom / Microsoft): advancing off the end IS the bubble.
      expect(actor.getSnapshot().value).toBe('bubblingNext');
    } else {
      // Mid-flow submit (Google): advance one inner slot, then walk to the terminal step,
      // whose plain Continue is the view-forwarded bubble — same net "inner completion → outer".
      expect(actor.getSnapshot().value).toBe('configuring');
      expect(actor.getSnapshot().context.stepIndex).toBe(submitIndex + 1);
      for (let i = submitIndex + 1; i < lastIndex; i++) {
        actor.send({ type: 'NEXT_INNER' });
      }
      expect(actor.getSnapshot().context.stepIndex).toBe(lastIndex);
    }
  });

  it('a mid-flow blocked-less advance does NOT bubble early (legacy) and the new machine stays within the inner flow', async () => {
    // Legacy: a non-terminal goNext advances one slot and never touches the parent.
    const parent = makeParent();
    const { result } = renderLegacyInner(steps, parent);
    await act(() => result.current.goNext());
    expect(result.current.current).toBe(steps[1]);
    expect(parent.goNext).not.toHaveBeenCalled();

    // New machine: NEXT_INNER from step 0 advances to step 1, staying in `configuring`.
    const actor = startNewConfigure(steps);
    actor.send({ type: 'NEXT_INNER' });
    expect(actor.getSnapshot().value).toBe('configuring');
    expect(actor.getSnapshot().context.stepIndex).toBe(1);
  });

  it('a first-inner back-nav backs out of the SAML sub-flow (legacy bubbles to parent.goPrev; the new machine returns to select-provider)', async () => {
    const parent = makeParent();
    const { result } = renderLegacyInner(steps, parent);
    expect(result.current.current).toBe(steps[0]);
    expect(result.current.isFirstStep).toBe(true);
    // First-position goPrev is the other scope boundary: it bubbles to the middle wizard,
    // which steps configure-provider → select-provider.
    await act(() => result.current.goPrev());
    expect(parent.goPrev).toHaveBeenCalledTimes(1);

    // New machine: PREV_INNER at inner step 0 returns to `selecting` (the collapsed equivalent).
    const actor = startNewConfigure(steps);
    expect(actor.getSnapshot().context.stepIndex).toBe(0);
    actor.send({ type: 'PREV_INNER' });
    expect(actor.getSnapshot().value).toBe('selecting');
  });
});
