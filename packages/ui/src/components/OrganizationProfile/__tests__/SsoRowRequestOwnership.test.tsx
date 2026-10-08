import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render } from '@/test/utils';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';

import { useSecuritySsoConnectionRowController } from '../security-sso-section.controller';
import { toSecuritySsoConnectionRow } from '../security-sso-section.model';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');
const Boundary = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);
type Controller = ReturnType<typeof useSecuritySsoConnectionRowController>;

const Status = () => {
  const card = useCardState();
  return (
    <>
      <span role='status'>{card.isLoading ? 'loading' : 'idle'}</span>
      {card.error && <span role='alert'>{card.error}</span>}
      <button
        type='button'
        onClick={() => card.setIdle()}
      >
        Old cleanup
      </button>
    </>
  );
};

const Row = ({
  id = 'connection_first',
  ownerKey = 'owner_1',
  canRun = () => true,
  setActive,
  remove = vi.fn().mockResolvedValue(undefined),
  open = vi.fn(),
  capture,
}: {
  id?: string;
  ownerKey?: string;
  canRun?: () => boolean;
  setActive: (id: string, active: boolean) => Promise<void>;
  remove?: (id: string) => Promise<void>;
  open?: (id: string) => void;
  capture?: (controller: Controller) => void;
}) => {
  const model = toSecuritySsoConnectionRow({
    ownerKey,
    canRun,
    connection: {
      id,
      name: 'SSO',
      provider: 'oidc_custom',
      active: false,
      logoPublicUrl: null,
      domains: ['example.com'],
      syncUserAttributes: false,
      disableAdditionalIdentifications: false,
      oauthConfig: { clientId: 'client', discoveryUrl: 'https://example.com/discovery' },
      samlConnection: null,
    },
    enterpriseConnectionMutations: {
      createConnection: vi.fn().mockResolvedValue(undefined),
      changeProvider: vi.fn().mockResolvedValue(undefined),
      updateConnection: vi.fn().mockResolvedValue(undefined),
      setConnectionActive: setActive,
      deleteConnection: remove,
      createTestRun: vi.fn().mockResolvedValue({ url: '' }),
    },
    organizationName: 'Organization',
    contentRef: { current: null },
    onConfigure: vi.fn(),
    onOpenConnection: open,
  });
  const controller = useSecuritySsoConnectionRowController(model);
  capture?.(controller);
  return (
    <button
      type='button'
      onClick={() => {
        void controller.actions![1].onClick();
      }}
    >
      Activate
    </button>
  );
};

const requestError = () =>
  new ClerkAPIResponseError('Request failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Request failed', long_message: 'Please try again' }],
  });

describe('SSO row request ownership', () => {
  it.each(['form', 'row'] as const)(
    'blocks the other request when the %s starts first in one event batch',
    async first => {
      const { wrapper } = await createFixtures();
      const deferred = createDeferredPromise<void>();
      const submit = vi.fn(() => deferred.promise);
      const setActive = vi.fn(() => deferred.promise);
      const { getByRole, getByTestId } = render(
        <Boundary>
          <Form.Root
            data-testid='form'
            onSubmit={submit}
          >
            <Form.SubmitButton />
          </Form.Root>
          <Row setActive={setActive} />
          <Status />
        </Boundary>,
        { wrapper },
      );
      const activate = getByRole('button', { name: 'Activate' });
      act(() => {
        if (first === 'form') {
          fireEvent.submit(getByTestId('form'));
          activate.click();
        } else {
          activate.click();
          fireEvent.submit(getByTestId('form'));
        }
      });
      await act(async () => {
        await Promise.resolve();
      });
      if (first === 'form') {
        expect(submit).toHaveBeenCalledOnce();
        expect(setActive).not.toHaveBeenCalled();
      } else {
        expect(setActive).toHaveBeenCalledExactlyOnceWith('connection_first', true);
        expect(submit).not.toHaveBeenCalled();
      }
      await act(async () => {
        deferred.resolve();
        await deferred.promise;
      });
      expect(getByRole('status')).toHaveTextContent('idle');
    },
  );

  it('blocks duplicate clicks and ignores an unrelated idle cleanup', async () => {
    const { wrapper } = await createFixtures();
    const deferred = createDeferredPromise<void>();
    const setActive = vi.fn(() => deferred.promise);
    const { getByRole } = render(
      <Boundary>
        <Row setActive={setActive} />
        <Status />
      </Boundary>,
      { wrapper },
    );
    const activate = getByRole('button', { name: 'Activate' });
    act(() => {
      activate.click();
      activate.click();
    });
    expect(setActive).toHaveBeenCalledOnce();
    fireEvent.click(getByRole('button', { name: 'Old cleanup' }));
    expect(getByRole('status')).toHaveTextContent('loading');
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(getByRole('status')).toHaveTextContent('idle');
  });

  it('keeps a replacement request loading when the closed row fails', async () => {
    const { wrapper } = await createFixtures();
    const oldRequest = createDeferredPromise<void>();
    const newRequest = createDeferredPromise<void>();
    const setActive = vi.fn((id: string) => (id === 'old' ? oldRequest.promise : newRequest.promise));
    const { getByRole, queryByRole, rerender } = render(
      <Boundary>
        <Row
          key='old'
          id='old'
          setActive={setActive}
        />
        <Status />
      </Boundary>,
      { wrapper },
    );
    fireEvent.click(getByRole('button', { name: 'Activate' }));
    rerender(
      <Boundary>
        <Row
          key='new'
          id='new'
          setActive={setActive}
        />
        <Status />
      </Boundary>,
    );
    expect(getByRole('status')).toHaveTextContent('idle');
    fireEvent.click(getByRole('button', { name: 'Activate' }));
    expect(setActive).toHaveBeenCalledTimes(2);
    await act(async () => {
      oldRequest.reject(requestError());
      await Promise.resolve();
    });
    expect(queryByRole('alert')).toBeNull();
    expect(getByRole('status')).toHaveTextContent('loading');
    await act(async () => {
      newRequest.resolve();
      await newRequest.promise;
    });
    expect(getByRole('status')).toHaveTextContent('idle');
  });

  it('does not run retained commands after the row closes', async () => {
    const { wrapper } = await createFixtures();
    const setActive = vi.fn().mockResolvedValue(undefined);
    const remove = vi.fn().mockResolvedValue(undefined);
    const open = vi.fn();
    let retained: Controller | undefined;
    const { rerender } = render(
      <Boundary>
        <Row
          setActive={setActive}
          remove={remove}
          open={open}
          capture={value => {
            retained = value;
          }}
        />
      </Boundary>,
      { wrapper },
    );
    const controller = retained!;
    rerender(<Boundary />);
    await act(async () => {
      await controller.actions![0].onClick();
      await controller.actions![1].onClick();
      await controller.onDelete();
    });
    expect(setActive).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it('does not revive retained commands when a different connection replaces the row', async () => {
    const { wrapper } = await createFixtures();
    const setActive = vi.fn().mockResolvedValue(undefined);
    let retained: Controller | undefined;
    const { rerender } = render(
      <Boundary>
        <Row
          id='old'
          setActive={setActive}
          capture={value => {
            retained = value;
          }}
        />
      </Boundary>,
      { wrapper },
    );
    const old = retained!;
    rerender(
      <Boundary>
        <Row
          id='new'
          setActive={setActive}
        />
      </Boundary>,
    );
    rerender(
      <Boundary>
        <Row
          id='old'
          setActive={setActive}
        />
      </Boundary>,
    );
    await act(async () => {
      await old.actions![1].onClick();
    });
    expect(setActive).not.toHaveBeenCalled();
  });

  it('shows a current request error and permits a retry', async () => {
    const { wrapper } = await createFixtures();
    const setActive = vi.fn().mockRejectedValueOnce(requestError()).mockResolvedValue(undefined);
    const { getByRole, queryByRole } = render(
      <Boundary>
        <Row setActive={setActive} />
        <Status />
      </Boundary>,
      { wrapper },
    );
    await act(async () => {
      fireEvent.click(getByRole('button', { name: 'Activate' }));
      await Promise.resolve();
    });
    expect(getByRole('alert')).toHaveTextContent('Please try again');
    expect(getByRole('status')).toHaveTextContent('idle');
    await act(async () => {
      fireEvent.click(getByRole('button', { name: 'Activate' }));
      await Promise.resolve();
    });
    expect(setActive).toHaveBeenCalledTimes(2);
    expect(queryByRole('alert')).toBeNull();
  });
  it('blocks row actions when the source loses ownership before render', async () => {
    const { wrapper } = await createFixtures();
    const canRun = vi.fn(() => true);
    const setActive = vi.fn().mockResolvedValue(undefined);
    const remove = vi.fn().mockResolvedValue(undefined);
    const open = vi.fn();
    let controller!: Controller;
    render(
      <Boundary>
        <Row
          setActive={setActive}
          remove={remove}
          open={open}
          canRun={canRun}
          capture={value => {
            controller = value;
          }}
        />
      </Boundary>,
      { wrapper },
    );
    canRun.mockReturnValue(false);
    await act(async () => {
      for (const action of controller.actions!) {
        await action.onClick();
      }
      await controller.onDelete();
    });
    expect(controller.canRun()).toBe(false);
    expect(setActive).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it('releases loading without showing an error after source ownership is lost', async () => {
    const { wrapper } = await createFixtures();
    const canRun = vi.fn(() => true);
    const pending = createDeferredPromise<void>();
    const setActive = vi.fn(() => pending.promise);
    const { getByRole, queryByRole } = render(
      <Boundary>
        <Row
          setActive={setActive}
          canRun={canRun}
        />
        <Status />
      </Boundary>,
      { wrapper },
    );
    fireEvent.click(getByRole('button', { name: 'Activate' }));
    canRun.mockReturnValue(false);
    await act(async () => {
      pending.reject(requestError());
      await pending.promise.catch(() => undefined);
    });
    expect(getByRole('status')).toHaveTextContent('idle');
    expect(queryByRole('alert')).toBeNull();
  });

  it('does not revive same-connection commands after the owner changes and returns', async () => {
    const { wrapper } = await createFixtures();
    const setActive = vi.fn().mockResolvedValue(undefined);
    const remove = vi.fn().mockResolvedValue(undefined);
    let controller!: Controller;
    const { rerender } = render(
      <Boundary>
        <Row
          setActive={setActive}
          remove={remove}
          capture={value => {
            controller = value;
          }}
        />
      </Boundary>,
      { wrapper },
    );
    const retained = controller;
    rerender(
      <Boundary>
        <Row
          setActive={setActive}
          ownerKey='owner_2'
        />
      </Boundary>,
    );
    rerender(
      <Boundary>
        <Row setActive={setActive} />
      </Boundary>,
    );
    await act(async () => {
      await retained.actions![1].onClick();
      await retained.onDelete();
    });
    expect(setActive).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('closes the old removal dialog when the row owner changes', async () => {
    const { wrapper } = await createFixtures();
    const setActive = vi.fn().mockResolvedValue(undefined);
    let controller!: Controller;
    const capture = (value: Controller) => {
      controller = value;
    };
    const { rerender } = render(
      <Boundary>
        <Row
          setActive={setActive}
          capture={capture}
        />
      </Boundary>,
      { wrapper },
    );
    act(() => {
      void controller.actions!.at(-1)!.onClick();
    });
    expect(controller.isRemoveDialogOpen).toBe(true);
    rerender(
      <Boundary>
        <Row
          setActive={setActive}
          ownerKey='owner_2'
          capture={capture}
        />
      </Boundary>,
    );
    expect(controller.isRemoveDialogOpen).toBe(false);
    rerender(
      <Boundary>
        <Row
          setActive={setActive}
          capture={capture}
        />
      </Boundary>,
    );
    expect(controller.isRemoveDialogOpen).toBe(false);
  });

  it('discards a deletion error after source ownership changes', async () => {
    const { wrapper } = await createFixtures();
    const canRun = vi.fn(() => true);
    const pending = createDeferredPromise<void>();
    const remove = vi.fn(() => pending.promise);
    let controller!: Controller;
    render(
      <Boundary>
        <Row
          setActive={vi.fn()}
          remove={remove}
          canRun={canRun}
          capture={value => {
            controller = value;
          }}
        />
      </Boundary>,
      { wrapper },
    );
    const completion = controller.onDelete();
    canRun.mockReturnValue(false);
    pending.reject(new Error('Earlier owner failed'));
    await expect(completion).resolves.toBeUndefined();
  });
});
