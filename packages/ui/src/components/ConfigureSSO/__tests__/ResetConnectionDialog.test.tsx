import type { DeletedObjectResource, EnterpriseConnectionResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

// The dialog rewinds the TOP-LEVEL wizard to the entry step via
// `goToStep('verify-domain')` after the delete (the entry step is guard-less, so
// it is always reachable once `hasConnection` drops).
const goToStep = vi.fn();

vi.mock('../elements/Wizard', () => ({
  useWizard: () => ({ goToStep }),
}));

const deleteEnterpriseConnection = vi.fn();

const connectionMockState = vi.hoisted(() => ({
  current: { id: 'idn_connection_1' } as Partial<EnterpriseConnectionResource> | null,
}));

vi.mock('../ConfigureSSOContext', () => ({
  useConfigureSSO: () => ({
    enterpriseConnection: connectionMockState.current,
    contentRef: { current: null },
    // The dialog reads the reverification-wrapped delete mutation off the
    // bundled `mutations` object instead of a raw `deleteEnterpriseConnection`.
    mutations: {
      deleteConnection: deleteEnterpriseConnection,
    },
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
  goToStep.mockReset();
  deleteEnterpriseConnection.mockReset();
  deleteEnterpriseConnection.mockResolvedValue({} as DeletedObjectResource);
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
    expect(deleteEnterpriseConnection).not.toHaveBeenCalled();
  });

  it('deletes the connection, rewinds the wizard to the entry step, and closes on a successful submit', async () => {
    resetMocks();
    const onClose = vi.fn();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderDialog(wrapper, { confirmationValue: 'Acme Inc', onClose });

    await userEvent.type(screen.getByLabelText(/below to continue/i), 'Acme Inc');
    await userEvent.click(screen.getByRole('button', { name: 'Reset connection' }));

    await waitFor(() => {
      expect(deleteEnterpriseConnection).toHaveBeenCalledWith('idn_connection_1');
    });
    expect(goToStep).toHaveBeenCalledWith('verify-domain');
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
