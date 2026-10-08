import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, waitFor } from '@/test/utils';

import { useCardState, withCardStateProvider } from '../contexts';
import { Form } from '../Form';
import { FormButtons } from '../FormButtons';

const { createFixtures } = bindCreateFixtures('UserProfile');
const Boundary = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);
const CardStatus = () => {
  const card = useCardState();
  return (
    <>
      <span role='status'>{card.isLoading ? 'loading' : 'idle'}</span>
      <button
        type='button'
        onClick={() => card.setLoading()}
      >
        External action
      </button>
    </>
  );
};
const Harness = ({
  source = 'first',
  submit,
  show = true,
}: {
  source?: string;
  submit: () => void | Promise<unknown>;
  show?: boolean;
}) => (
  <Boundary>
    <CardStatus />
    {show && (
      <Form.Root
        key={source}
        onSubmit={submit}
      >
        <Form.SubmitButton />
      </Form.Root>
    )}
  </Boundary>
);
const form = (container: HTMLElement) => container.querySelector('form')!;

describe('Form request lifecycle', () => {
  it.each(['default', 'enabled', 'direct'] as const)(
    'keeps %s action buttons disabled during form and card requests',
    async buttons => {
      const { wrapper } = await createFixtures();
      const deferred = createDeferredPromise<void>();
      const submit = vi.fn(() => deferred.promise);
      const reset = vi.fn();
      const { container, getByRole, userEvent } = render(
        <Boundary>
          <CardStatus />
          <Form.Root onSubmit={submit}>
            {buttons === 'direct' ? (
              <>
                <Form.SubmitButton
                  isDisabled={false}
                  isLoading={false}
                />
                <Form.ResetButton
                  isDisabled={false}
                  onClick={reset}
                >
                  Cancel
                </Form.ResetButton>
              </>
            ) : (
              <FormButtons
                isDisabled={buttons === 'enabled' ? false : undefined}
                onReset={reset}
              />
            )}
          </Form.Root>
        </Boundary>,
        { wrapper },
      );
      const save = getByRole('button', { name: buttons === 'direct' ? 'Continue' : 'Save' });
      const cancel = getByRole('button', { name: 'Cancel' });
      expect(save).toBeEnabled();
      expect(cancel).toBeEnabled();
      fireEvent.submit(form(container));
      expect(save).toBeDisabled();
      expect(cancel).toBeDisabled();
      fireEvent.click(cancel);
      expect(reset).not.toHaveBeenCalled();
      await act(async () => {
        deferred.resolve();
        await deferred.promise;
      });
      expect(save).toBeEnabled();
      expect(cancel).toBeEnabled();
      await userEvent.click(getByRole('button', { name: 'External action' }));
      expect(save).toBeDisabled();
      expect(cancel).toBeDisabled();
      fireEvent.click(save);
      fireEvent.click(cancel);
      fireEvent.submit(form(container));
      expect(submit).toHaveBeenCalledOnce();
      expect(reset).not.toHaveBeenCalled();
    },
  );

  it('starts one submission for two events before rendering', async () => {
    const { wrapper } = await createFixtures();
    const deferred = createDeferredPromise<void>();
    const submit = vi.fn(() => deferred.promise);
    const { container, getByRole } = render(<Harness submit={submit} />, { wrapper });
    const button = getByRole('button', { name: 'Continue' });
    act(() => {
      fireEvent.submit(form(container));
      fireEvent.submit(form(container));
    });
    expect(submit).toHaveBeenCalledOnce();
    expect(button).toBeDisabled();
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(button).toBeEnabled();
  });

  it.each(['success', 'handled failure'] as const)(
    'does not release a replacement request after an old %s',
    async outcome => {
      const { wrapper } = await createFixtures();
      const first = createDeferredPromise<void>();
      const second = createDeferredPromise<void>();
      const firstSubmit = () => first.promise.catch(() => {});
      const { container, getByRole, rerender } = render(<Harness submit={firstSubmit} />, { wrapper });
      fireEvent.submit(form(container));
      rerender(
        <Harness
          source='second'
          submit={() => second.promise}
        />,
      );
      await waitFor(() => expect(getByRole('status')).toHaveTextContent('idle'));
      const button = getByRole('button', { name: 'Continue' });
      fireEvent.submit(form(container));
      await act(async () => {
        if (outcome === 'success') {
          first.resolve();
        } else {
          first.reject(new Error('Old request failed'));
        }
        await first.promise.catch(() => {});
      });
      expect(getByRole('status')).toHaveTextContent('loading');
      expect(button).toBeDisabled();
      await act(async () => {
        second.resolve();
        await second.promise;
      });
      expect(getByRole('status')).toHaveTextContent('idle');
      expect(button).toBeEnabled();
    },
  );

  it('releases loading when the pending form closes', async () => {
    const { wrapper } = await createFixtures();
    const deferred = createDeferredPromise<void>();
    const { container, getByRole, rerender } = render(<Harness submit={() => deferred.promise} />, { wrapper });
    fireEvent.submit(form(container));
    rerender(
      <Harness
        show={false}
        submit={() => deferred.promise}
      />,
    );
    await waitFor(() => expect(getByRole('status')).toHaveTextContent('idle'));
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(getByRole('status')).toHaveTextContent('idle');
  });

  it('does not submit while another card action is loading', async () => {
    const { wrapper } = await createFixtures();
    const submit = vi.fn();
    const { container, getByRole, userEvent } = render(<Harness submit={submit} />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'External action' }));
    fireEvent.submit(form(container));
    expect(submit).not.toHaveBeenCalled();
    expect(getByRole('status')).toHaveTextContent('loading');
  });

  it('permits a new submission after a handled failure', async () => {
    const { wrapper } = await createFixtures();
    const first = createDeferredPromise<void>();
    const submit = vi
      .fn()
      .mockImplementationOnce(() => first.promise.catch(() => {}))
      .mockResolvedValueOnce(undefined);
    const { container, getByRole } = render(<Harness submit={submit} />, { wrapper });
    fireEvent.submit(form(container));
    await act(async () => {
      first.reject(new Error('Request failed'));
      await first.promise.catch(() => {});
    });
    expect(getByRole('button', { name: 'Continue' })).toBeEnabled();
    fireEvent.submit(form(container));
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(2));
  });
});
