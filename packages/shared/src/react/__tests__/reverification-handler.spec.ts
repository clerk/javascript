import { describe, expect, it, vi } from 'vitest';

import { reverificationError } from '../../authorization-errors';
import { __internal_createReverificationHandler, type NeedsReverificationParameters } from '../hooks/useReverification';

function deferred<T>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => undefined;
  const promise = new Promise<T>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

function harness() {
  const abort = new AbortController();
  const challenge = deferred<NeedsReverificationParameters>();
  const onNeedsReverification = vi.fn(challenge.resolve);
  const wrap = __internal_createReverificationHandler({
    openUIComponent: vi.fn(),
    telemetry: undefined,
    signal: abort.signal,
    onNeedsReverification,
  });
  return { abort, challenge, onNeedsReverification, wrap };
}

describe('reverification handler cancellation', () => {
  it('does not issue a request for an already cancelled run', async () => {
    const { abort, wrap } = harness();
    abort.abort();
    const fetcher = vi.fn(() => Promise.resolve({ done: true }));
    await expect(wrap(fetcher)()).rejects.toMatchObject({ code: 'reverification_cancelled' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('supports synchronous cancellation through the public callback', async () => {
    const fetcher = vi.fn(() => Promise.resolve(reverificationError()));
    const wrap = __internal_createReverificationHandler({
      openUIComponent: vi.fn(),
      telemetry: undefined,
      onNeedsReverification: ({ cancel }) => cancel(),
    });
    await expect(wrap(fetcher)()).rejects.toMatchObject({ code: 'reverification_cancelled' });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('rejects before a held initial request finishes and discards its hint', async () => {
    const { abort, onNeedsReverification, wrap } = harness();
    const response = deferred<ReturnType<typeof reverificationError>>();
    const fetcher = vi.fn(() => response.promise);
    const result = wrap(fetcher)();
    abort.abort();
    await expect(result).rejects.toMatchObject({ code: 'reverification_cancelled' });
    response.resolve(reverificationError());
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(onNeedsReverification).not.toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('discards a hint from response body parsing that finishes after cancellation', async () => {
    const { abort, onNeedsReverification, wrap } = harness();
    const body = deferred<ReturnType<typeof reverificationError>>();
    const parsing = deferred<void>();
    const response = new Response();
    vi.spyOn(response, 'json').mockImplementation(() => {
      parsing.resolve(undefined);
      return body.promise;
    });
    const result = wrap(() => Promise.resolve(response))();
    await parsing.promise;
    abort.abort();
    await expect(result).rejects.toMatchObject({ code: 'reverification_cancelled' });
    body.resolve(reverificationError());
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(onNeedsReverification).not.toHaveBeenCalled();
  });

  it('does not retry if cancelled after completion but before the retry starts', async () => {
    const { abort, challenge, wrap } = harness();
    const fetcher = vi.fn(() => Promise.resolve(reverificationError()));
    const result = wrap(fetcher)();
    const { complete } = await challenge.promise;
    complete();
    abort.abort();
    await expect(result).rejects.toMatchObject({ code: 'reverification_cancelled' });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('rejects an issued retry immediately and ignores its late success', async () => {
    const { abort, challenge, wrap } = harness();
    const retry = deferred<{ done: true }>();
    const started = deferred<void>();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(reverificationError())
      .mockImplementationOnce(() => {
        started.resolve(undefined);
        return retry.promise;
      });
    const result = wrap(fetcher)();
    (await challenge.promise).complete();
    await started.promise;
    abort.abort();
    await expect(result).rejects.toMatchObject({ code: 'reverification_cancelled' });
    retry.resolve({ done: true });
    await retry.promise;
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('preserves completion when a public challenge callback cancels after completion', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(reverificationError()).mockResolvedValue({ done: true });
    const wrap = __internal_createReverificationHandler({
      openUIComponent: vi.fn(),
      telemetry: undefined,
      onNeedsReverification: ({ complete, cancel }) => {
        complete();
        cancel();
      },
    });
    await expect(wrap(fetcher)()).resolves.toEqual({ done: true });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('retries once without cancellation', async () => {
    const first = harness();
    const fetcher = vi.fn().mockResolvedValueOnce(reverificationError()).mockResolvedValue({ done: true });
    const result = first.wrap(fetcher)();
    (await first.challenge.promise).complete();
    await expect(result).resolves.toEqual({ done: true });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
