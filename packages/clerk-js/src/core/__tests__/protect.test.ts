import type { ProtectLoader } from '@clerk/shared/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Protect } from '../protect';
import { __internal_resetProtectStorage } from '../protectSession';
import type { Environment } from '../resources';

const environment = (loaders: unknown[], id = ''): Environment =>
  ({ protectConfig: { id, loaders } }) as unknown as Environment;

/** No `src`: jsdom fetches real URLs, which fires `error` and races the events we drive here. */
const loader = (overrides: Partial<ProtectLoader> = {}): ProtectLoader => ({
  target: 'head',
  type: 'script',
  attributes: { 'data-cid': '{cid}' },
  tokenTimeoutMs: 200,
  ...overrides,
});

const nowSeconds = () => Math.floor(Date.now() / 1_000);

/** The token loader is injected under the acquisition lock, so it appears a few ticks in. */
const injected = async (selector: string): Promise<Element> => {
  for (let i = 0; i < 100; i++) {
    const element = document.head.querySelector(selector);
    if (element) {
      return element;
    }
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  throw new Error(`nothing matched ${selector}`);
};

const serveInline = (element: Element, overrides: Record<string, unknown> = {}) => {
  (globalThis as unknown as Record<string, unknown>).__clerk_specter = {
    v: 3,
    id: '11111111-2222-3333-4444-555555555555',
    cid: element.getAttribute('data-cid'),
    ready: Promise.resolve({ token: 'v1.payload.mac', exp: nowSeconds() + 43_200 }),
    ...overrides,
  };
  element.dispatchEvent(new Event('load'));
};

beforeEach(() => {
  localStorage.clear();
  __internal_resetProtectStorage();
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  delete (globalThis as unknown as Record<string, unknown>).__clerk_specter;
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  __internal_resetProtectStorage();
  delete (globalThis as unknown as Record<string, unknown>).__clerk_specter;
});

describe('Protect.load', () => {
  it('does nothing without a protect config', () => {
    new Protect().load(environment([]));
    expect(document.head.querySelector('script')).toBeNull();
    expect(localStorage.getItem('__clerk_protect_pid')).toBeNull();
  });

  it('applies an untemplated loader unchanged and reports no params', async () => {
    const protect = new Protect();
    protect.load(
      environment([
        { target: 'head', type: 'script', attributes: { 'data-loader': 'https://loader.example.com/ins_2abc.js' } },
      ]),
    );

    expect(document.head.querySelector('script')?.getAttribute('data-loader')).toBe(
      'https://loader.example.com/ins_2abc.js',
    );
    await expect(protect.getRequestParams()).resolves.toBeUndefined();
    expect(localStorage.getItem('__clerk_protect_pid')).toBeNull();
  });

  it('substitutes the placeholders it recognises and leaves the rest verbatim', async () => {
    const protect = new Protect();
    protect.load(
      environment(
        [
          loader({
            attributes: {
              'data-src': 'https://loader.example.com/{instance_id}/{cid}/loader.js',
              'data-pid': '{pid}',
              'data-rid': '{rid}',
              'data-unknown': '{whatever}',
              'data-count': 3,
            },
          }),
        ],
        'ins_2abc',
      ),
    );

    const element = await injected('script');
    const pid = element.getAttribute('data-pid') as string;
    const rid = element.getAttribute('data-rid') as string;

    expect(pid).toMatch(/^[a-z2-7]{26}$/);
    expect(rid).toMatch(/^[a-z2-7]{26}$/);
    expect(element.getAttribute('data-src')).toBe(`https://loader.example.com/ins_2abc/1-${pid}-${rid}/loader.js`);
    expect(element.getAttribute('data-unknown')).toBe('{whatever}');
    expect(element.getAttribute('data-count')).toBe('3');
  });

  it('substitutes placeholders in textContent as well as attributes', async () => {
    const protect = new Protect();
    protect.load(environment([loader({ textContent: 'window.__vendor_cid = "{cid}";' })], 'ins_2abc'));

    const element = await injected('script');
    expect(element.textContent).toBe(`window.__vendor_cid = "${element.getAttribute('data-cid')}";`);
    expect(element.textContent).not.toContain('{cid}');
  });

  it('leaves {instance_id} verbatim when the environment does not carry one', async () => {
    const protect = new Protect();
    protect.load(environment([loader({ attributes: { 'data-src': '{instance_id}/{cid}.js' } })]));

    expect((await injected('script')).getAttribute('data-src')).toContain('{instance_id}');
  });

  it('attaches the token once it has been acquired', async () => {
    const protect = new Protect();
    protect.load(environment([loader()]));

    serveInline(await injected('script'));

    await expect(protect.getRequestParams()).resolves.toMatchObject({
      __clerk_protect_token: 'v1.payload.mac',
      __clerk_protect_status: 'ok',
    });
  });

  it('still applies the other loaders when a token for this browser session is shared', async () => {
    localStorage.setItem(
      '__clerk_protect_st',
      JSON.stringify({ token: 'v1.cached.mac', exp: nowSeconds() + 43_200, rid: 'b'.repeat(26) }),
    );

    const protect = new Protect();
    protect.load(
      environment([
        loader({ attributes: { 'data-role': 'detection' } }),
        loader({ attributes: { 'data-cid': '{cid}', 'data-role': 'token' } }),
      ]),
    );

    // Acquisition happens once per browser session, so the token loader is skipped…
    expect(document.head.querySelector('[data-role="token"]')).toBeNull();
    // …but the detection loader has its own job and runs on every page load regardless.
    expect(document.head.querySelector('[data-role="detection"]')).not.toBeNull();
    await expect(protect.getRequestParams()).resolves.toMatchObject({ __clerk_protect_token: 'v1.cached.mac' });
  });

  it('does not apply a loader that is outside its rollout', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const protect = new Protect();
    protect.load(environment([loader({ rollout: 0.1 })]));

    expect(document.head.querySelector('script')).toBeNull();
    // Out of rollout means Protect is off for this browser, so there is nothing to report either.
    await expect(protect.getRequestParams()).resolves.toBeUndefined();
  });

  it('reports script_error when the loader element fails to load', async () => {
    const protect = new Protect();
    protect.load(environment([loader({ tokenTimeoutMs: 5_000 })]));

    (await injected('script')).dispatchEvent(new Event('error'));

    await expect(protect.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'script_error' });
  });

  it('drops a malformed loader entry without failing the rest of the load', async () => {
    const protect = new Protect();

    // The config is server-controlled and cached; a bad entry must not take Clerk.load() down.
    expect(() => protect.load(environment([null, loader({ attributes: { 'data-role': 'good' } })]))).not.toThrow();

    expect(document.head.querySelector('[data-role="good"]')).not.toBeNull();
  });

  it('survives a loader config that is not an array of objects at all', () => {
    const protect = new Protect();
    expect(() => protect.load(environment(['nope', 42, undefined]))).not.toThrow();
  });
});
