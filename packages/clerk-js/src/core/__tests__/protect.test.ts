import type { ProtectLoader } from '@clerk/shared/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Protect } from '../protect';
import type { Environment } from '../resources';

const environment = (loaders: ProtectLoader[], id = ''): Environment =>
  ({ protectConfig: { id, loaders } }) as unknown as Environment;

const nowSeconds = () => Math.floor(Date.now() / 1_000);

const originalFetch = global.fetch;

beforeEach(() => {
  localStorage.clear();
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ token: 'v1.payload.mac', exp: nowSeconds() + 43_200 }),
    }),
  ) as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
  global.fetch = originalFetch;
  localStorage.clear();
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
        { target: 'head', type: 'script', attributes: { src: 'https://loader.example.com/ins_2abc/loader.js' } },
      ]),
    );

    expect(document.head.querySelector('script')?.getAttribute('src')).toBe(
      'https://loader.example.com/ins_2abc/loader.js',
    );
    await expect(protect.getRequestParams()).resolves.toBeUndefined();
    expect(localStorage.getItem('__clerk_protect_pid')).toBeNull();
  });

  it('substitutes the placeholders it recognises and leaves the rest verbatim', () => {
    const protect = new Protect();
    protect.load(
      environment(
        [
          {
            target: 'head',
            type: 'script',
            attributes: {
              src: 'https://loader.example.com/{instance_id}/{cid}/loader.js',
              'data-pid': '{pid}',
              'data-rid': '{rid}',
              'data-unknown': '{whatever}',
              'data-count': 3,
            },
          },
        ],
        'ins_2abc',
      ),
    );

    const element = document.head.querySelector('script') as HTMLScriptElement;
    const pid = element.getAttribute('data-pid') as string;
    const rid = element.getAttribute('data-rid') as string;

    expect(pid).toMatch(/^[a-z2-7]{26}$/);
    expect(rid).toMatch(/^[a-z2-7]{26}$/);
    expect(element.getAttribute('src')).toBe(`https://loader.example.com/ins_2abc/1-${pid}-${rid}/loader.js`);
    expect(element.getAttribute('data-unknown')).toBe('{whatever}');
    expect(element.getAttribute('data-count')).toBe('3');
  });

  it('leaves {instance_id} verbatim when the environment does not carry one', () => {
    const protect = new Protect();
    protect.load(
      environment([
        { target: 'head', type: 'script', attributes: { src: 'https://loader.example.com/{instance_id}/{cid}.js' } },
      ]),
    );

    expect(document.head.querySelector('script')?.getAttribute('src')).toContain('{instance_id}');
  });

  it('attaches the token once it has been acquired', async () => {
    const protect = new Protect();
    protect.load(
      environment([
        {
          target: 'head',
          type: 'script',
          attributes: { src: 'https://loader.example.com/ins_2abc/{cid}/loader.js' },
          tokenTimeoutMs: 500,
        },
      ]),
    );

    await expect(protect.getRequestParams()).resolves.toMatchObject({
      __clerk_protect_token: 'v1.payload.mac',
      __clerk_protect_status: 'ok',
    });
  });

  it('skips the loaders entirely when a token for this browser session is already shared', async () => {
    localStorage.setItem(
      '__clerk_protect_st',
      JSON.stringify({ token: 'v1.cached.mac', exp: nowSeconds() + 43_200, rid: 'b'.repeat(26) }),
    );

    const protect = new Protect();
    protect.load(
      environment([
        {
          target: 'head',
          type: 'script',
          attributes: { src: 'https://loader.example.com/ins_2abc/{cid}/loader.js' },
        },
      ]),
    );

    // A token is already cached, so acquisition happens once per session, not once per tab.
    expect(document.head.querySelector('script')).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
    await expect(protect.getRequestParams()).resolves.toMatchObject({ __clerk_protect_token: 'v1.cached.mac' });
  });

  it('does not apply a loader that is outside its rollout', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const protect = new Protect();
    protect.load(
      environment([
        {
          rollout: 0.1,
          target: 'head',
          type: 'script',
          attributes: { src: 'https://loader.example.com/ins_2abc/{cid}/loader.js' },
        },
      ]),
    );

    expect(document.head.querySelector('script')).toBeNull();
    // Out of rollout means Protect is off for this browser, so there is nothing to report either.
    await expect(protect.getRequestParams()).resolves.toBeUndefined();
  });

  it('reports script_error when the loader element fails to load', async () => {
    (global.fetch as any).mockImplementation(() => Promise.resolve({ status: 202, json: () => Promise.resolve({}) }));

    const protect = new Protect();
    protect.load(
      environment([
        {
          target: 'head',
          type: 'script',
          attributes: { src: 'https://loader.example.com/ins_2abc/{cid}/loader.js' },
          tokenTimeoutMs: 5_000,
        },
      ]),
    );

    document.head.querySelector('script')?.dispatchEvent(new Event('error'));

    await expect(protect.getRequestParams()).resolves.toMatchObject({ __clerk_protect_status: 'script_error' });
  });
});
