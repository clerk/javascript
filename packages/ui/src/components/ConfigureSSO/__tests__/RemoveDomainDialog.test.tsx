import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';
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
  } = {},
) => {
  const onClose = props.onClose ?? vi.fn();
  const utils = render(
    <CardStateProvider>
      <RemoveDomainDialog
        isOpen={props.isOpen ?? true}
        onClose={onClose}
        domain={props.domain ?? 'acme.com'}
        isConnectionActive={props.isConnectionActive ?? false}
        onRemove={() => onRemove()}
        contentRef={{ current: null }}
      />
    </CardStateProvider>,
    { wrapper },
  );
  return { ...utils, onClose };
};

const resetMocks = () => {
  onRemove.mockReset();
  onRemove.mockResolvedValue(undefined);
};

describe('RemoveDomainDialog', () => {
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
});
