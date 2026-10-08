import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, screen, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { RemoveDomainDialog } from '../RemoveDomainDialog';

const onRemove = vi.fn();

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

const renderDialog = (
  wrapper: React.ComponentType<{ children?: React.ReactNode }>,
  props: {
    isOpen?: boolean;
    onClose?: () => void;
    domain?: string;
    isConnectionActive?: boolean;
    scopeKey?: string;
  } = {},
) => {
  const onClose = props.onClose ?? vi.fn();
  const dialog = (values: typeof props) => (
    <CardStateProvider>
      <RemoveDomainDialog
        isOpen={values.isOpen ?? true}
        onClose={onClose}
        domain={values.domain ?? 'acme.com'}
        isConnectionActive={values.isConnectionActive ?? false}
        scopeKey={values.scopeKey ?? 'first'}
        canRun={() => true}
        onRemove={() => onRemove()}
        contentRef={{ current: null }}
      />
    </CardStateProvider>
  );
  const utils = render(dialog(props), { wrapper });
  return {
    ...utils,
    onClose,
    rerenderDialog: (values: typeof props) => utils.rerender(dialog({ ...props, ...values })),
  };
};

const resetMocks = () => {
  onRemove.mockReset();
  onRemove.mockResolvedValue(undefined);
};

describe('RemoveDomainDialog', () => {
  it('updates its copy when the domain changes', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { rerenderDialog } = renderDialog(wrapper);
    rerenderDialog({ domain: 'second.com' });
    expect(screen.getByText("You're about to remove second.com from this enterprise connection.")).toBeInTheDocument();
    expect(
      screen.queryByText("You're about to remove acme.com from this enterprise connection."),
    ).not.toBeInTheDocument();
  });

  it('updates the sign-in warning when activation changes', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { rerenderDialog } = renderDialog(wrapper);
    rerenderDialog({ isConnectionActive: true });
    expect(screen.getByText(/Users won't be able to sign-in with acme\.com anymore/i)).toBeInTheDocument();
  });

  it('keeps an earlier completion from closing or settling a newer domain request', async () => {
    resetMocks();
    const earlier = createDeferredPromise<void>();
    const current = createDeferredPromise<void>();
    onRemove.mockReturnValueOnce(earlier.promise).mockReturnValueOnce(current.promise);
    const { wrapper } = await createFixtures();
    const { userEvent, rerenderDialog, onClose } = renderDialog(wrapper);
    await userEvent.click(screen.getByRole('button', { name: 'Remove domain' }));
    rerenderDialog({ domain: 'second.com' });
    const button = screen.getByRole('button', { name: 'Remove domain' });
    expect(button).not.toBeDisabled();
    await userEvent.click(button);
    await act(async () => {
      earlier.resolve();
      await earlier.promise;
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
    await act(async () => {
      current.resolve();
      await current.promise;
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('clears an earlier scope error when another connection opens the dialog', async () => {
    resetMocks();
    onRemove.mockRejectedValueOnce(
      new ClerkAPIResponseError('Request failed', {
        status: 500,
        data: [{ code: 'internal_server_error', message: 'Request failed', long_message: 'Earlier scope failed' }],
      }),
    );
    const { wrapper } = await createFixtures();
    const { userEvent, rerenderDialog } = renderDialog(wrapper);
    await userEvent.click(screen.getByRole('button', { name: 'Remove domain' }));
    expect(await screen.findByText('Earlier scope failed')).toBeInTheDocument();
    rerenderDialog({ scopeKey: 'second' });
    expect(screen.queryByText('Earlier scope failed')).not.toBeInTheDocument();
  });

  it('does not render when `isOpen` is `false`', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderDialog(wrapper, { isOpen: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Removing domain' })).not.toBeInTheDocument();
  });

  it('renders the dialog chrome and actions when isOpen is true', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderDialog(wrapper, { domain: 'acme.com' });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Removing domain' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove domain' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('warns about sign-in impact when the connection is active', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderDialog(wrapper, { domain: 'acme.com', isConnectionActive: true });

    expect(screen.getByText(/Users won't be able to sign-in with acme\.com anymore/i)).toBeInTheDocument();
  });

  it('shows the neutral copy when the connection is inactive', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderDialog(wrapper, { domain: 'acme.com', isConnectionActive: false });

    expect(screen.getByText("You're about to remove acme.com from this enterprise connection.")).toBeInTheDocument();
    expect(screen.queryByText(/Users won't be able to sign-in/i)).not.toBeInTheDocument();
  });

  it('invokes onClose when Cancel is clicked', async () => {
    resetMocks();
    const onClose = vi.fn();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderDialog(wrapper, { onClose });

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('awaits the removal and closes on a successful submit', async () => {
    resetMocks();
    const onClose = vi.fn();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderDialog(wrapper, { onClose });

    await userEvent.click(screen.getByRole('button', { name: 'Remove domain' }));

    await waitFor(() => {
      expect(onRemove).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('keeps the dialog open and surfaces an error when removal fails', async () => {
    resetMocks();
    onRemove.mockRejectedValueOnce(
      new ClerkAPIResponseError('Error', {
        data: [
          {
            code: 'internal_server_error',
            long_message: 'Something went wrong while removing the domain.',
            message: 'Removal failed.',
          },
        ],
        status: 500,
      }),
    );
    const onClose = vi.fn();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderDialog(wrapper, { onClose });

    await userEvent.click(screen.getByRole('button', { name: 'Remove domain' }));

    await waitFor(() => {
      expect(onRemove).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('Something went wrong while removing the domain.')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
