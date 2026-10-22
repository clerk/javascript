import { ClerkRuntimeError, isClerkAPIResponseError } from '../../error';
import type { ProtectCheckResource } from '../../types';
import { ERROR_CODES } from './constants';
import { executeProtectCheck } from './protectCheck';

// A GET reload does not re-mint an expired challenge today, so an uncapped reload loop would spin forever.
export const MAX_EXPIRED_PROTECT_CHECK_RELOADS = 2;

export interface ProtectCheckRunnerResource<TResource> {
  getProtectCheck: () => ProtectCheckResource | null | undefined;
  getResource: () => TResource;
  reload: () => Promise<unknown>;
  submitProtectCheck: (params: { proofToken: string }) => Promise<TResource>;
}

export interface ProtectCheckRunOptions {
  container: HTMLDivElement;
  expiredReloads: { current: number };
  signal?: AbortSignal;
  setWidgetVisible?: (visible: boolean) => Promise<void>;
  loadTimeoutMs?: number;
}

/** `reissued` means the expired challenge was replaced by a fresh one on reload, so run again with it. */
export type ProtectCheckRunOutcome<TResource> = { status: 'resolved'; resource: TResource } | { status: 'reissued' };

const isExpired = (protectCheck: ProtectCheckResource) =>
  protectCheck.expiresAt !== undefined && protectCheck.expiresAt < Date.now();

const expiredError = () =>
  new ClerkRuntimeError('Protect verification expired', { code: ERROR_CODES.PROTECT_CHECK_TIMED_OUT });

const abortedError = () => new ClerkRuntimeError('Protect check aborted by caller', { code: 'protect_check_aborted' });

const reloadExpired = async <TResource>(
  resource: ProtectCheckRunnerResource<TResource>,
  expiredReloads: { current: number },
): Promise<ProtectCheckRunOutcome<TResource>> => {
  if (expiredReloads.current >= MAX_EXPIRED_PROTECT_CHECK_RELOADS) {
    throw expiredError();
  }
  expiredReloads.current += 1;

  await resource.reload();

  const refreshed = resource.getProtectCheck();
  if (!refreshed) {
    return { status: 'resolved', resource: resource.getResource() };
  }
  if (isExpired(refreshed)) {
    throw expiredError();
  }
  return { status: 'reissued' };
};

/** Runs one Protect challenge against a sign-in or sign-up resource and submits the proof token. */
export async function runProtectCheck<TResource>(
  resource: ProtectCheckRunnerResource<TResource>,
  protectCheck: ProtectCheckResource,
  options: ProtectCheckRunOptions,
): Promise<ProtectCheckRunOutcome<TResource>> {
  const { container, expiredReloads, signal, setWidgetVisible, loadTimeoutMs } = options;
  if (signal?.aborted) {
    throw abortedError();
  }
  if (isExpired(protectCheck)) {
    return reloadExpired(resource, expiredReloads);
  }

  // Deliberately unraced. Only the module load is bounded. The challenge itself may wait on a
  // person, and a timeout here used to abort valid challenges.
  const proofToken = await executeProtectCheck(protectCheck, container, { signal, setWidgetVisible, loadTimeoutMs });
  if (signal?.aborted) {
    throw abortedError();
  }

  try {
    const updated = await resource.submitProtectCheck({ proofToken });
    return { status: 'resolved', resource: updated };
  } catch (err) {
    if (signal?.aborted) {
      throw abortedError();
    }
    if (isClerkAPIResponseError(err) && err.errors?.[0]?.code === ERROR_CODES.PROTECT_CHECK_ALREADY_RESOLVED) {
      await resource.reload();
      return { status: 'resolved', resource: resource.getResource() };
    }
    throw err;
  }
}
