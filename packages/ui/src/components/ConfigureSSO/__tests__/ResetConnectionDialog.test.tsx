import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

// The dialog no longer touches the wizard. On confirm it calls the context
// `resetConnection()` — a pure delete, no navigation — and the wizard
// self-corrects to the furthest-reachable step once the active step's guard
// breaks. That lets the dialog be triggered from ANY footer (including nested
// SAML configure footers) without binding to a nested wizard.
const resetConnection = vi.fn();

const connectionMockState = vi.hoisted(() => ({
  current: { id: 'idn_connection_1' } as Partial<EnterpriseConnectionResource> | null,
}));

vi.mock('../ConfigureSSOContext', () => ({
  useConfigureSSO: () => ({
    enterpriseConnection: connectionMockState.current,
    contentRef: { current: null },
    // The dialog's confirm calls the context `resetConnection`, which owns the
    // reverification-wrapped delete. No navigation — the wizard self-corrects.
    resetConnection,
  }),
}));

import { ResetConnectionDialog } from '../ResetConnectionDialog';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

const renderDialog = (
  wrapper: React.ComponentType<{ children?: React.ReactNode }>,
  props: { isOpen?: boolean; onClose?: () => void; confirmationValue?: string } = {},
) => {
  const onClose = props.onClose ?? vi.fn();
  const utils = render(
    <CardStateProvider>
      <ResetConnectionDialog
        isOpen={props.isOpen ?? true}
        onClose={onClose}
        confirmationValue={props.confirmationValue ?? 'Acme Inc'}
      />
    </CardStateProvider>,
    { wrapper },
  );
  return { ...utils, onClose };
};

const resetMocks = () => {
  resetConnection.mockReset();
  resetConnection.mockResolvedValue(undefined);
  connectionMockState.current = { id: 'idn_connection_1' };
};

describe('ResetConnectionDialog', () => {
  it('does not render when `isOpen` is `false`', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderDialog(wrapper, { isOpen: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Reset connection' })).not.toBeInTheDocument();
  });

  it('renders the dialog chrome and actions when isOpen is true', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderDialog(wrapper, { confirmationValue: 'Acme Inc' });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Reset connection' })).toBeInTheDocument();
    expect(
      screen.getByText(
        /Are you sure you want to reset the connection\? This action is irreversible and you will have to configure all steps again/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset connection' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('keeps Reset disabled while the input is empty', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderDialog(wrapper, { confirmationValue: 'Acme Inc' });

    expect(screen.getByRole('button', { name: 'Reset connection' })).toBeDisabled();
  });

  it('keeps Reset disabled when the input does not match the confirmation value', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderDialog(wrapper, { confirmationValue: 'Acme Inc' });

    await userEvent.type(screen.getByLabelText(/below to continue/i), 'wrong');
    expect(screen.getByRole('button', { name: 'Reset connection' })).toBeDisabled();
  });

  it('enables Reset when the input matches the confirmation value exactly', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderDialog(wrapper, { confirmationValue: 'Acme Inc' });

    await userEvent.type(screen.getByLabelText(/below to continue/i), 'Acme Inc');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Reset connection' })).toBeEnabled();
    });
  });

  it('invokes onClose when Cancel is clicked', async () => {
    resetMocks();
    const onClose = vi.fn();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderDialog(wrapper, { onClose });

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(resetConnection).not.toHaveBeenCalled();
  });

  it('resets the connection (delete + re-derive) and closes on a successful submit', async () => {
    resetMocks();
    const onClose = vi.fn();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderDialog(wrapper, { confirmationValue: 'Acme Inc', onClose });

    await userEvent.type(screen.getByLabelText(/below to continue/i), 'Acme Inc');
    await userEvent.click(screen.getByRole('button', { name: 'Reset connection' }));

    await waitFor(() => {
      expect(resetConnection).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
