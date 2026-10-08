import { ClerkAPIResponseError, ClerkRuntimeError } from '@clerk/shared/error';
import type { BackupCodeResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import copy from 'copy-to-clipboard';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, screen, waitFor } from '@/test/utils';
import { ActionRoot } from '@/ui/elements/Action/ActionRoot';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { useMfaBackupCodeCreateController } from '../mfa-backup-code-create.controller';
import { useMfaBackupCodeCreateModel } from '../mfa-backup-code-create.model';
import { useMfaBackupCodeListController } from '../mfa-backup-code-list.controller';
import { useMfaBackupCodeListModel } from '../mfa-backup-code-list.model';
import { MfaBackupCodeCreateForm } from '../MfaBackupCodeCreateForm';
import { MfaBackupCodeScreen } from '../MfaBackupCodeScreen';

vi.mock('copy-to-clipboard', () => ({ default: vi.fn(() => true) }));

const { createFixtures } = bindCreateFixtures('UserProfile');
const codes = ['12345678', '87654321'];
const resource = (): BackupCodeResource => ({ codes: codes.slice() }) as BackupCodeResource;
const failure = () =>
  new ClerkAPIResponseError('Backup failed', {
    status: 422,
    data: [{ code: 'backup_failed', message: 'Backup failed' }],
  });
const callbacks = () => ({ onSuccess: vi.fn(), onReset: vi.fn() });

async function setup() {
  const view = await createFixtures(f => {
    f.withBackupCode();
    f.withUser({ email_addresses: ['test@clerk.com'] });
  });
  const user = view.fixtures.clerk.user!;
  user.createBackupCode.mockResolvedValue(resource());
  const switchAccount = () => {
    const replacement = { ...user, id: 'replacement' };
    vi.spyOn(view.fixtures.clerk, 'user', 'get').mockReturnValue(replacement);
    view.fixtures.clerk.__internal_lastEmittedResources = {
      ...view.fixtures.clerk.__internal_lastEmittedResources,
      user: replacement,
    };
  };
  return { ...view, user, switchAccount };
}

async function setupDownload(initialCodes = codes) {
  const view = await setup();
  const create = vi.fn().mockImplementation(() => `blob:backup-${create.mock.calls.length}`);
  const revoke = vi.fn();
  class DownloadURL extends URL {
    static createObjectURL = create;
    static revokeObjectURL = revoke;
  }
  vi.stubGlobal('URL', DownloadURL);
  const links: HTMLAnchorElement[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    links.push(this);
  });
  const hook = renderHook(
    ({ backupCodes }) => useMfaBackupCodeListController(useMfaBackupCodeListModel(), { backupCodes }),
    {
      wrapper: view.wrapper,
      initialProps: { backupCodes: initialCodes },
    },
  );
  return { ...view, ...hook, create, revoke, links };
}

describe('Backup-code ownership', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.mocked(copy).mockClear();
  });

  it('keeps copied codes and does not retain SDK resource arrays', async () => {
    const view = await setup();
    const sdk = resource();
    view.user.createBackupCode.mockResolvedValueOnce(sdk);
    const hook = renderHook(() => useMfaBackupCodeCreateModel(), { wrapper: view.wrapper });
    let result!: { codes: string[] } | undefined;
    await act(async () => {
      result = await hook.result.current.createBackupCodeData();
    });
    expect(result).toEqual({ codes });
    expect(result).not.toBe(sdk);
    expect(result!.codes).not.toBe(sdk.codes);
    sdk.codes.push('changed');
    result!.codes.pop();
    hook.rerender();
    expect(hook.result.current.backupCode?.codes).toEqual(codes);
    await expect(hook.result.current.createBackupCodeData()).resolves.toEqual({ codes });
    expect(view.user.createBackupCode).toHaveBeenCalledOnce();
  });

  it('shares one pending creation request', async () => {
    const view = await setup();
    const deferred = createDeferredPromise<BackupCodeResource>();
    view.user.createBackupCode.mockReturnValueOnce(deferred.promise);
    const hook = renderHook(() => useMfaBackupCodeCreateModel(), { wrapper: view.wrapper });
    const pending = hook.result.current.createBackupCodeData();
    expect(hook.result.current.createBackupCodeData()).toBe(pending);
    expect(view.user.createBackupCode).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.resolve(resource());
      await pending;
    });
  });

  it.each(['user', 'session', 'client'] as const)(
    'rejects retained creation after canonical %s changes',
    async field => {
      const view = await setup();
      const hook = renderHook(() => useMfaBackupCodeCreateModel(), { wrapper: view.wrapper });
      vi.spyOn(view.fixtures.clerk, field, 'get').mockReturnValue({
        ...view.fixtures.clerk[field],
        id: 'other',
      } as never);
      await expect(hook.result.current.createBackupCodeData()).resolves.toBeUndefined();
      expect(view.user.createBackupCode).not.toHaveBeenCalled();
    },
  );

  it.each(['success', 'failure'] as const)('ignores a late creation %s after an account change', async outcome => {
    const view = await setup();
    const deferred = createDeferredPromise<BackupCodeResource>();
    view.user.createBackupCode.mockReturnValueOnce(deferred.promise);
    const hook = renderHook(() => useMfaBackupCodeCreateModel(), { wrapper: view.wrapper });
    const old = hook.result.current;
    const pending = old.createBackupCodeData();
    view.switchAccount();
    hook.rerender();
    await act(async () => {
      if (outcome === 'success') {
        deferred.resolve(resource());
      } else {
        deferred.reject(failure());
      }
      expect(await pending).toBeUndefined();
    });
    expect(old.canRun()).toBe(false);
    expect(hook.result.current.backupCode).toBeUndefined();
  });

  it('does not retry creation after unmount during reverification', async () => {
    const view = await setup();
    view.user.createBackupCode.mockRejectedValueOnce(
      new ClerkAPIResponseError('Reverification required', {
        status: 401,
        data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
      }),
    );
    const open = vi.spyOn(view.fixtures.clerk, '__internal_openReverification').mockImplementation(() => undefined);
    const hook = renderHook(() => useMfaBackupCodeCreateModel(), { wrapper: view.wrapper });
    const pending = hook.result.current.createBackupCodeData();
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    hook.unmount();
    open.mock.calls[0][0].afterVerification!();
    await expect(pending).resolves.toBeUndefined();
    expect(view.user.createBackupCode).toHaveBeenCalledOnce();
  });

  it('creates one set of codes under StrictMode and completes the form', async () => {
    const view = await setup();
    const props = callbacks();
    const rendered = render(
      <StrictMode>
        <MfaBackupCodeCreateForm {...props} />
      </StrictMode>,
      { wrapper: view.wrapper },
    );
    expect(await screen.findAllByText(codes[0])).toHaveLength(2);
    expect(view.user.createBackupCode).toHaveBeenCalledOnce();
    await rendered.userEvent.click(screen.getByRole('button', { name: /^finish$/i }));
    expect(props.onSuccess).toHaveBeenCalledExactlyOnceWith();
  });

  it('waits for the instruction screen before creating and resets that screen on account change', async () => {
    const view = await setup();
    const props = callbacks();
    const onChange = vi.fn();
    const rendered = render(
      <ActionRoot
        value='backup'
        onChange={onChange}
      >
        <MfaBackupCodeScreen {...props} />
      </ActionRoot>,
      { wrapper: view.wrapper },
    );
    expect(view.user.createBackupCode).not.toHaveBeenCalled();
    await rendered.userEvent.click(screen.getByRole('button', { name: /^finish$/i }));
    await screen.findAllByText(codes[0]);
    expect(view.user.createBackupCode).toHaveBeenCalledOnce();
    view.switchAccount();
    rendered.rerender(
      <ActionRoot
        value='backup'
        onChange={onChange}
      >
        <MfaBackupCodeScreen {...props} />
      </ActionRoot>,
    );
    expect(screen.queryByText(codes[0])).not.toBeInTheDocument();
    await rendered.userEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
    expect(view.user.createBackupCode).toHaveBeenCalledOnce();
  });

  it.each(['failure', 'cancellation'] as const)(
    'ignores a late %s when only the create view unmounts',
    async outcome => {
      const view = await setup();
      const deferred = createDeferredPromise<BackupCodeResource>();
      view.user.createBackupCode.mockReturnValueOnce(deferred.promise);
      let model!: ReturnType<typeof useMfaBackupCodeCreateModel>;
      let card!: ReturnType<typeof useCardState>;
      const props = callbacks();
      const Probe = () => {
        useMfaBackupCodeCreateController(model, props);
        return null;
      };
      const Boundary = withCardStateProvider(({ visible }: { visible: boolean }) => {
        card = useCardState();
        return visible ? <Probe /> : null;
      });
      const Parent = ({ visible = true }: { visible?: boolean }) => {
        model = useMfaBackupCodeCreateModel();
        return <Boundary visible={visible} />;
      };
      const rendered = render(<Parent />, { wrapper: view.wrapper });
      await waitFor(() => expect(view.user.createBackupCode).toHaveBeenCalledOnce());
      rendered.rerender(<Parent visible={false} />);
      act(() => {
        card.setError('Current error');
      });
      await act(async () => {
        deferred.reject(
          outcome === 'failure' ? failure() : new ClerkRuntimeError('Cancelled', { code: 'reverification_cancelled' }),
        );
        await deferred.promise.catch(() => undefined);
      });
      expect(card.error).toBe('Current error');
      expect(props.onReset).not.toHaveBeenCalled();
    },
  );

  it.each(['failure', 'cancellation'] as const)('handles a current creation %s under StrictMode', async outcome => {
    const view = await setup();
    view.user.createBackupCode.mockRejectedValueOnce(
      outcome === 'failure' ? failure() : new ClerkRuntimeError('Cancelled', { code: 'reverification_cancelled' }),
    );
    const props = callbacks();
    let model!: ReturnType<typeof useMfaBackupCodeCreateModel>;
    let card!: ReturnType<typeof useCardState>;
    const Probe = () => {
      card = useCardState();
      useMfaBackupCodeCreateController(model, props);
      return null;
    };
    const Boundary = withCardStateProvider(Probe);
    const Parent = () => {
      model = useMfaBackupCodeCreateModel();
      return <Boundary />;
    };
    render(
      <StrictMode>
        <Parent />
      </StrictMode>,
      { wrapper: view.wrapper },
    );
    if (outcome === 'failure') {
      await waitFor(() => expect(card.error).toBe('Backup failed'));
    } else {
      await waitFor(() => expect(props.onReset).toHaveBeenCalledExactlyOnceWith());
    }
    expect(view.user.createBackupCode).toHaveBeenCalledOnce();
  });

  it('downloads the current codes and removes its temporary link', async () => {
    const view = await setupDownload();
    view.result.current.onDownloadTxtFile();
    expect(view.links).toHaveLength(1);
    expect(view.links[0].isConnected).toBe(false);
    expect(view.links[0].download).toBe(`${view.result.current.applicationName}_backup_codes.txt`);
    const blob = view.create.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/plain');
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Expected a text download'));
        }
      };
      reader.onerror = reject;
      reader.readAsText(blob);
    });
    expect(text).toContain(codes.join('\n'));
    expect(text).toContain(view.result.current.userIdentifier);
    expect(text).toContain(view.result.current.applicationName);
    await waitFor(() => expect(view.revoke).toHaveBeenCalledExactlyOnceWith('blob:backup-1'));
  });

  it('releases each download URL after its click and only once', async () => {
    const view = await setupDownload();
    vi.useFakeTimers();
    view.result.current.onDownloadTxtFile();
    view.result.current.onDownloadTxtFile();
    expect(view.create).toHaveBeenCalledTimes(2);
    expect(view.revoke).not.toHaveBeenCalled();
    expect(document.querySelectorAll('a[download]')).toHaveLength(0);
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(view.revoke.mock.calls).toEqual([['blob:backup-1'], ['blob:backup-2']]);
    view.unmount();
    expect(view.revoke).toHaveBeenCalledTimes(2);
  });

  it.each(['unmount', 'codes', 'account'] as const)('releases pending downloads after %s changes', async change => {
    const view = await setupDownload();
    vi.useFakeTimers();
    const old = view.result.current;
    old.onDownloadTxtFile();
    if (change === 'unmount') {
      view.unmount();
    } else if (change === 'codes') {
      view.rerender({ backupCodes: ['new-code'] });
    } else {
      view.switchAccount();
      view.rerender({ backupCodes: codes });
    }
    expect(view.revoke).toHaveBeenCalledExactlyOnceWith('blob:backup-1');
    expect(vi.getTimerCount()).toBe(0);
    old.onDownloadTxtFile();
    act(() => {
      old.onCopy();
      old.print();
    });
    expect(view.create).toHaveBeenCalledOnce();
    expect(copy).not.toHaveBeenCalled();
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(view.revoke).toHaveBeenCalledOnce();
  });

  it('releases the URL when the download click fails', async () => {
    const view = await setupDownload();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementationOnce(() => {
      throw new Error('Download failed');
    });
    expect(() => view.result.current.onDownloadTxtFile()).toThrow('Download failed');
    expect(view.revoke).toHaveBeenCalledExactlyOnceWith('blob:backup-1');
    expect(document.querySelectorAll('a[download]')).toHaveLength(0);
  });

  it('copies and prints current codes and clears the copied state when codes change', async () => {
    const view = await setupDownload();
    const print = vi.fn();
    view.result.current.printableProps.onPrint(print);
    view.result.current.print();
    expect(print).toHaveBeenCalledOnce();
    act(() => {
      view.result.current.onCopy();
    });
    expect(copy).toHaveBeenCalledWith(codes.join(','), expect.anything());
    expect(view.result.current.hasCopied).toBe(true);
    view.rerender({ backupCodes: ['new-code'] });
    expect(view.result.current.hasCopied).toBe(false);
    act(() => {
      view.result.current.onCopy();
    });
    expect(copy).toHaveBeenLastCalledWith('new-code', expect.anything());
    expect(view.result.current.hasCopied).toBe(true);
  });

  it.each(['user', 'session', 'client'] as const)(
    'blocks copy, print and download after canonical %s changes',
    async field => {
      const view = await setupDownload();
      const print = vi.fn();
      view.result.current.printableProps.onPrint(print);
      vi.spyOn(view.fixtures.clerk, field, 'get').mockReturnValue({
        ...view.fixtures.clerk[field],
        id: 'other',
      } as never);
      act(() => {
        view.result.current.onCopy();
        view.result.current.print();
        view.result.current.onDownloadTxtFile();
      });
      expect(copy).not.toHaveBeenCalled();
      expect(print).not.toHaveBeenCalled();
      expect(view.create).not.toHaveBeenCalled();
    },
  );

  it('does not allocate resources for an empty code list', async () => {
    const view = await setupDownload([]);
    act(() => {
      view.result.current.onCopy();
      view.result.current.print();
      view.result.current.onDownloadTxtFile();
    });
    expect(copy).not.toHaveBeenCalled();
    expect(view.create).not.toHaveBeenCalled();
  });
});
