import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { tick } from '../../machines/__tests__/test-utils';
import type { OrganizationProfileSecurityWizardTestContext } from '../organization-profile-security-wizard-test.machine';
import { organizationProfileSecurityWizardTestMachine } from '../organization-profile-security-wizard-test.machine';

const NO_RUN_MESSAGE = 'Run a test and complete it successfully before continuing.';

function start(context: Partial<OrganizationProfileSecurityWizardTestContext> = {}) {
  const createTestRun = vi.fn(() => Promise.resolve());
  const revalidateHasSuccessfulTestRun = vi.fn(() => Promise.resolve(false));
  const actor = createActor(organizationProfileSecurityWizardTestMachine, {
    context: {
      noSuccessfulRunMessage: NO_RUN_MESSAGE,
      createTestRun,
      revalidateHasSuccessfulTestRun,
      ...context,
    },
  });
  actor.start();
  return { actor, createTestRun, revalidateHasSuccessfulTestRun };
}

describe('organizationProfileSecurityWizardTestMachine — create run', () => {
  it('seeds at idle', () => {
    const { actor } = start();
    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('creates a test run and returns to idle', async () => {
    const { actor, createTestRun } = start();

    actor.send({ type: 'CREATE_RUN' });
    expect(actor.getSnapshot().value).toBe('creatingRun');
    expect(createTestRun).toHaveBeenCalledTimes(1);

    await tick();
    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('surfaces the error and returns to idle when creating a run fails', async () => {
    const createTestRun = vi.fn(() => Promise.reject(new Error('Connection unreachable')));
    const { actor } = start({ createTestRun });

    actor.send({ type: 'CREATE_RUN' });
    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.error).toBe('Connection unreachable');
  });
});

describe('organizationProfileSecurityWizardTestMachine — continue', () => {
  it('bubbles straight to the parent when a successful run is already known', () => {
    const { actor, revalidateHasSuccessfulTestRun } = start({ hasSuccessfulTestRun: true });

    actor.send({ type: 'CONTINUE' });

    expect(actor.getSnapshot().value).toBe('bubblingNext');
    expect(revalidateHasSuccessfulTestRun).not.toHaveBeenCalled();
  });

  it('revalidates the success probe on continue and bubbles when it now passes', async () => {
    const revalidateHasSuccessfulTestRun = vi.fn(() => Promise.resolve(true));
    const { actor } = start({ hasSuccessfulTestRun: false, revalidateHasSuccessfulTestRun });

    actor.send({ type: 'CONTINUE' });
    expect(actor.getSnapshot().value).toBe('validating');
    expect(revalidateHasSuccessfulTestRun).toHaveBeenCalledTimes(1);

    await tick();
    expect(actor.getSnapshot().value).toBe('bubblingNext');
  });

  it('shows the no-successful-run message when the revalidated probe is still empty', async () => {
    const { actor } = start({ hasSuccessfulTestRun: false });

    actor.send({ type: 'CONTINUE' });
    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.error).toBe(NO_RUN_MESSAGE);
  });

  it('surfaces the error and returns to idle when the revalidation throws', async () => {
    const revalidateHasSuccessfulTestRun = vi.fn(() => Promise.reject(new Error('Probe failed')));
    const { actor } = start({ hasSuccessfulTestRun: false, revalidateHasSuccessfulTestRun });

    actor.send({ type: 'CONTINUE' });
    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.error).toBe('Probe failed');
  });

  it('clears a stale error when the fast-path advance bubbles', () => {
    const { actor } = start({ hasSuccessfulTestRun: true, error: 'stale' });

    actor.send({ type: 'CONTINUE' });

    expect(actor.getSnapshot().value).toBe('bubblingNext');
    expect(actor.getSnapshot().context.error).toBeNull();
  });
});

describe('organizationProfileSecurityWizardTestMachine — re-entry', () => {
  it('resets back to idle and clears the error on ENTER', async () => {
    const { actor } = start({ hasSuccessfulTestRun: true });
    actor.send({ type: 'CONTINUE' });
    expect(actor.getSnapshot().value).toBe('bubblingNext');

    // Re-mounting the step (e.g. a PREV back from activate) resets the flow.
    actor.send({ type: 'ENTER' });
    expect(actor.getSnapshot().value).toBe('idle');

    // A prior error is cleared on re-entry.
    const failed = start({ hasSuccessfulTestRun: false });
    failed.actor.send({ type: 'CONTINUE' });
    await tick();
    expect(failed.actor.getSnapshot().context.error).toBe(NO_RUN_MESSAGE);
    failed.actor.send({ type: 'ENTER' });
    expect(failed.actor.getSnapshot().context.error).toBeNull();
  });
});
