import { ClerkRuntimeError } from '@clerk/shared/error';
import { ERROR_CODES, PROTECT_CHECK_ELEMENT_ID } from '@clerk/shared/internal/clerk-js/constants';
import type { ProtectCheckJSON, ProtectCheckResource } from '@clerk/shared/types';

import type { FapiResponseJSON } from './fapiClient';
import type { Clerk } from './resources/internal';

export const PROTECT_CHECK_MODAL_WRAPPER_ID = 'cl-modal-protect-check-wrapper';
export const PROTECT_CHECK_MODAL_CONTAINER_ID = 'cl-modal-protect-check-container';

/**
 * The managed modal opens invisible so a challenge that resolves without interaction never
 * flashes UI (same posture as the captcha modal). Unlike captcha, a challenge can legitimately
 * run for a while (proof-of-transfer), so a still-running check reveals the modal after this
 * delay instead of leaving the page frozen with nothing visible.
 */
const MODAL_REVEAL_DELAY_MS = 500;

/**
 * Upper bound on waiting for the modal container to appear after `openModal` resolves. An older
 * hot-loaded `@clerk/ui` without the protect-check modal accepts the unknown modal name and
 * renders nothing — without this bound the caller's promise would hang forever.
 */
const MODAL_MOUNT_TIMEOUT_MS = 5_000;

/**
 * Chained challenges are an SDK-side loop (the PATCH response may carry a fresh check). A
 * server bug that chains forever must not trap the user in the modal.
 */
const MAX_CHAINED_CHALLENGES = 5;

/**
 * Rounds of clear-the-gate-then-replay per gated call. The managed path promises the caller a
 * post-challenge result, so perpetual re-gating is a protocol failure and throws — returning a
 * still-pending payload would silently reintroduce the stall this gate exists to remove.
 */
const MAX_GATED_ROUNDS = 3;

type ProtectFlow = 'signIn' | 'signUp';

/**
 * Raw resource fetch, provided by `BaseResource._fetch` so the gate's own PATCH/GET calls get
 * the exact semantics of any resource call (deferred-hydration rules, ClerkAPIResponseError on
 * 4xx) without re-entering FraudProtection.
 */
export type RawResourceFetch = (
  requestInit: { method: 'GET' | 'PATCH'; path: string; body?: unknown },
  opts?: { forceUpdateClient?: boolean },
) => Promise<FapiResponseJSON<unknown> | null>;

/**
 * Per-request context handed down from `BaseResource._fetch` through `FraudProtection.execute`.
 * `publish` performs the client piggyback update that `_baseFetch` defers for gated payloads —
 * the gate publishes only when a registered host owns the pending state; managed resolutions
 * never publish the intermediate gate.
 */
export interface ProtectRequestContext {
  rawFetch: RawResourceFetch;
  publish: (payload: FapiResponseJSON<unknown> | null) => void;
  signal?: AbortSignal;
  /** Lets the gate wait out an in-flight legacy captcha modal before opening its own UI. */
  waitForCaptchaIdle?: () => Promise<unknown>;
}

interface GatedInfo {
  flow: ProtectFlow;
  id: string;
  check: ProtectCheckResource;
}

interface ChallengeHost {
  container: HTMLDivElement;
  setWidgetVisible?: (visible: boolean) => Promise<void>;
  release: () => Promise<void>;
}

type MaybeGatedResponse = {
  object?: string;
  id?: string;
  protect_check?: ProtectCheckJSON | null;
};

function toProtectCheckResource(json: ProtectCheckJSON): ProtectCheckResource {
  return {
    status: json.status,
    token: json.token,
    sdkUrl: json.sdk_url,
    expiresAt: json.expires_at,
    uiHints: json.ui_hints,
  };
}

function abortedError(): ClerkRuntimeError {
  return new ClerkRuntimeError('Protect check aborted by caller', { code: 'protect_check_aborted' });
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw abortedError();
  }
}

/**
 * A payload gates the calling request when its direct response is a sign-in/sign-up carrying a
 * pending `protect_check`. Only the direct response is inspected: the gated call's own response
 * is the authoritative signal, and reacting to the piggybacked `client` mirror would double-handle
 * gates that belong to a different in-flight call. (OAuth redirect completion, which only ever
 * sees the nested mirror, gets its own intent-scoped resolver — PROT-968.)
 */
export function findPendingProtectCheck(payload: FapiResponseJSON<unknown> | null): GatedInfo | null {
  const response = payload?.response as MaybeGatedResponse | null | undefined;
  if (!response || typeof response !== 'object') {
    return null;
  }
  if (response.object !== 'sign_in' && response.object !== 'sign_up') {
    return null;
  }
  if (!response.id || response.protect_check?.status !== 'pending') {
    return null;
  }
  return {
    flow: response.object === 'sign_in' ? 'signIn' : 'signUp',
    id: response.id,
    check: toProtectCheckResource(response.protect_check),
  };
}

/**
 * Bounded, abortable element wait. `@clerk/shared`'s `waitForElement` deliberately never
 * rejects; here an absent element is an answer (older UI, broken mount), not something to wait
 * on forever.
 */
function waitForElementBounded(selector: string, timeoutMs: number, signal?: AbortSignal): Promise<HTMLElement | null> {
  return new Promise(resolve => {
    const immediate = document.querySelector<HTMLElement>(selector);
    if (immediate) {
      return resolve(immediate);
    }
    let settled = false;
    const observer = new MutationObserver(() => {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        settle(el);
      }
    });
    const timeoutId = setTimeout(() => settle(null), timeoutMs);
    const onAbort = () => settle(null);
    const settle = (el: HTMLElement | null) => {
      if (settled) {
        return;
      }
      settled = true;
      observer.disconnect();
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', onAbort);
      resolve(el);
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

/**
 * Resolves Protect challenges (`protect_check`) automatically so custom-flow apps never see the
 * gate: when a resource call comes back gated, the challenge runs in a Clerk-owned host — the
 * `clerk-protect-check` placement marker when the page provides one, a managed modal otherwise —
 * the proof is submitted, and then the **original operation is replayed** (the stored proof on
 * the attempt lets the replay pass), so the caller receives the true result of the operation it
 * requested. Clearing the gate alone is not enough: for pre-op gates (e.g. a gated
 * `prepareFirstFactor`) the gated side effect only happens on the replay.
 *
 * Prebuilt components (and any other surface that renders challenges itself) opt out by
 * registering a host for their flow, in which case gated payloads pass through untouched.
 *
 * Mirrors `FraudProtection`'s posture for the legacy captcha: one challenge session at a time
 * (concurrent gated calls wait, then replay), and the caller's promise is held for the duration.
 */
export class ProtectCheckGate {
  private static instance: ProtectCheckGate;

  private hostCounts: Record<ProtectFlow, number> = { signIn: 0, signUp: 0 };
  private inflightSession: Promise<unknown> | null = null;

  public static getInstance(): ProtectCheckGate {
    if (!ProtectCheckGate.instance) {
      ProtectCheckGate.instance = new ProtectCheckGate();
    }
    return ProtectCheckGate.instance;
  }

  /**
   * Declares that a mounted surface which renders challenges itself (the prebuilt SignIn/SignUp
   * components) owns gated payloads for the given flow; managed handling stands down while any
   * registration is live. The inline placement marker is NOT a registrant — it only relocates
   * where the managed gate renders. Returns a disposer.
   */
  public registerHost(flow: ProtectFlow): () => void {
    this.hostCounts[flow] += 1;
    let disposed = false;
    return () => {
      if (!disposed) {
        disposed = true;
        this.hostCounts[flow] -= 1;
      }
    };
  }

  public hasRegisteredHost(flow: ProtectFlow): boolean {
    return this.hostCounts[flow] > 0;
  }

  /** Lets the legacy captcha coordinator wait out an in-flight challenge session. */
  public waitForIdle(): Promise<unknown> {
    return this.inflightSession ?? Promise.resolve();
  }

  public async process<T>(clerk: Clerk, payload: T, replay: () => Promise<T>, ctx: ProtectRequestContext): Promise<T> {
    let current = payload;
    let rounds = 0;

    for (;;) {
      const gated = findPendingProtectCheck(current as FapiResponseJSON<unknown> | null);
      if (!gated) {
        return current;
      }
      if (this.hasRegisteredHost(gated.flow)) {
        // A mounted surface owns this gate: deliberately publish the pending state (deferred by
        // `_baseFetch`) so that surface — and anything else observing client state — sees it.
        ctx.publish(current as FapiResponseJSON<unknown> | null);
        return current;
      }
      if (rounds >= MAX_GATED_ROUNDS) {
        throw new ClerkRuntimeError('Protect check could not be cleared after multiple attempts', {
          code: 'protect_check_execution_failed',
        });
      }
      rounds += 1;
      throwIfAborted(ctx.signal);

      if (this.inflightSession) {
        // Another gated call owns the challenge UI. Wait it out (its failure is its caller's to
        // surface), then replay below — the stored proof on the attempt lets the replay pass.
        await this.inflightSession.catch(() => undefined);
      } else {
        const session = this.resolveGated(clerk, gated, ctx);
        this.inflightSession = session.catch(() => undefined);
        try {
          await session;
        } finally {
          this.inflightSession = null;
        }
      }

      throwIfAborted(ctx.signal);
      current = await replay();
    }
  }

  /**
   * Runs challenges until the gate is clear (chained checks included). Resolves the gate ONLY —
   * the caller replays the original operation afterwards.
   */
  private async resolveGated(clerk: Clerk, gated: GatedInfo, ctx: ProtectRequestContext): Promise<void> {
    // Fail closed where the challenge cannot run: the gate requires a remote `import(sdk_url)`
    // that no-RHC builds must not perform, and a DOM to host the widget. The guard lives here
    // (not in the shared lifecycle module) because @clerk/shared compiles with the flag
    // hard-coded `false`.
    if (__BUILD_DISABLE_RHC__ || typeof document === 'undefined') {
      throw new ClerkRuntimeError('Protect verification is not supported in this environment', {
        code: ERROR_CODES.PROTECT_CHECK_UNSUPPORTED_ENVIRONMENT,
      });
    }

    // Pragmatic mutual exclusion with the legacy captcha modal (which has its own single-flight):
    // never stack the two Clerk-owned modals. A full shared coordinator can replace both later.
    await ctx.waitForCaptchaIdle?.().catch(() => undefined);
    throwIfAborted(ctx.signal);

    const lifecycle = await import('@clerk/shared/internal/clerk-js/protectCheckLifecycle');
    const host = await this.acquireHost(clerk, ctx.signal);

    const basePath = gated.flow === 'signIn' ? '/client/sign_ins' : '/client/sign_ups';
    const reload = () => ctx.rawFetch({ method: 'GET', path: `${basePath}/${gated.id}` }, { forceUpdateClient: true });
    const submit = (proofToken: string) =>
      ctx.rawFetch({
        method: 'PATCH',
        path: `${basePath}/${gated.id}/protect_check`,
        body: { proof_token: proofToken },
      });

    // Every payload consumed inside the session must belong to the attempt being resolved; a
    // null (offline), wrong-flow, or wrong-id response is a protocol violation, not "gate
    // cleared" — treating it as clearance would leak precisely the state this path hides.
    const extractCheck = (payload: FapiResponseJSON<unknown> | null): ProtectCheckResource | null => {
      const response = payload?.response as MaybeGatedResponse | null | undefined;
      const expectedObject = gated.flow === 'signIn' ? 'sign_in' : 'sign_up';
      if (!response || response.object !== expectedObject || response.id !== gated.id) {
        throw new ClerkRuntimeError('Protect check received an unexpected response while resolving', {
          code: 'protect_check_execution_failed',
        });
      }
      return response.protect_check?.status === 'pending' ? toProtectCheckResource(response.protect_check) : null;
    };

    try {
      let latest: FapiResponseJSON<unknown> | null = null;
      let check: ProtectCheckResource | null = gated.check;
      let expiredReloads = 0;
      let challengesRun = 0;

      while (check) {
        throwIfAborted(ctx.signal);

        if (lifecycle.isProtectCheckExpired(check)) {
          if (expiredReloads >= lifecycle.MAX_EXPIRED_RELOADS) {
            throw new ClerkRuntimeError('Protect verification expired', {
              code: ERROR_CODES.PROTECT_CHECK_TIMED_OUT,
            });
          }
          expiredReloads += 1;
          latest = await reload();
          check = extractCheck(latest);
          continue;
        }

        if (challengesRun >= MAX_CHAINED_CHALLENGES) {
          throw new ClerkRuntimeError('Protect check chained challenge limit exceeded', {
            code: 'protect_check_execution_failed',
          });
        }
        challengesRun += 1;

        const proofToken = await lifecycle.executeProtectCheckWithTimeout(check, host.container, {
          signal: ctx.signal,
          setWidgetVisible: host.setWidgetVisible,
        });

        const result = await lifecycle.submitProtectCheckProof<FapiResponseJSON<unknown> | null>({
          proofToken,
          submitProtectCheck: ({ proofToken: token }) => submit(token),
          reload: async () => {
            latest = await reload();
          },
          getResource: () => latest,
          isCancelled: () => !!ctx.signal?.aborted,
        });
        if (result.status === 'cancelled') {
          throw abortedError();
        }
        latest = result.resource;
        check = extractCheck(latest);
      }
    } finally {
      // Awaited so a session is not considered finished (and the single-flight not released)
      // while its modal is still closing — an unawaited close could race a follow-up session's
      // freshly opened modal.
      await host.release();
    }
  }

  private async acquireHost(clerk: Clerk, signal?: AbortSignal): Promise<ChallengeHost> {
    const markers = document.querySelectorAll<HTMLElement>(`#${PROTECT_CHECK_ELEMENT_ID}`);
    if (markers.length > 1) {
      console.warn(
        `Clerk: multiple elements with id "${PROTECT_CHECK_ELEMENT_ID}" found; using the first. Keep a single placement marker.`,
      );
    }
    const marker = markers[0];
    if (marker) {
      if (marker instanceof HTMLDivElement) {
        return {
          container: marker,
          release: () => {
            // The run owns the marker's contents, not the marker: leave the customer's node,
            // drop any solved/errored widget so the next run (or their layout) starts clean.
            while (marker.firstChild) {
              marker.removeChild(marker.firstChild);
            }
            return Promise.resolve();
          },
        };
      }
      console.warn(
        `Clerk: the "${PROTECT_CHECK_ELEMENT_ID}" placement element must be a <div>; using a modal instead.`,
      );
    }

    try {
      await clerk.__internal_openProtectCheckModal();
    } catch {
      // Components-not-ready or UI unavailable. Protect cannot fail open — the server enforces
      // the gate — so surface a runtime error instead of skipping (contrast: captcha skips).
      throw new ClerkRuntimeError('Protect check UI failed to open', {
        code: 'protect_check_execution_failed',
      });
    }

    const container = await waitForElementBounded(
      `#${PROTECT_CHECK_MODAL_CONTAINER_ID}`,
      MODAL_MOUNT_TIMEOUT_MS,
      signal,
    );
    if (!container) {
      await clerk.__internal_closeProtectCheckModal().catch(() => undefined);
      throwIfAborted(signal);
      // Covers an older hot-loaded @clerk/ui that accepts the unknown modal name but renders
      // nothing — bounded failure instead of an eternal hang (PROT-969).
      throw new ClerkRuntimeError('Protect check UI failed to open', {
        code: 'protect_check_execution_failed',
      });
    }

    const setWrapperVisible = (visible: boolean) => {
      const wrapper = document.getElementById(PROTECT_CHECK_MODAL_WRAPPER_ID);
      wrapper?.style.setProperty('visibility', visible ? 'visible' : 'hidden');
      wrapper?.style.setProperty('pointer-events', visible ? 'all' : 'none');
    };

    // Reveal on the first of: the script announcing a visible widget, or the delay elapsing for
    // a still-running (e.g. proof-of-transfer) check. A `false` counter-signal is ignored — the
    // modal closes moments later on resolution, and re-hiding a revealed modal mid-submit reads
    // as a glitch.
    let revealed = false;
    const reveal = () => {
      if (!revealed) {
        revealed = true;
        setWrapperVisible(true);
      }
    };
    const revealTimer = setTimeout(reveal, MODAL_REVEAL_DELAY_MS);

    return {
      container: container as HTMLDivElement,
      setWidgetVisible: (visible: boolean) => {
        if (visible) {
          clearTimeout(revealTimer);
          reveal();
        }
        return Promise.resolve();
      },
      release: async () => {
        clearTimeout(revealTimer);
        await clerk.__internal_closeProtectCheckModal().catch(() => undefined);
      },
    };
  }
}
