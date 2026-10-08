import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { localizationKeys } from '@/customizables';
import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, screen, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { ResetConnectionDialog } from '../ResetConnectionDialog';

const deleteConnection = vi.fn();

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

const renderDialog = (
  wrapper: React.ComponentType<{ children?: React.ReactNode }>,
  props: {
    isOpen?: boolean;
    requestKey?: string;
    onClose?: () => void;
    confirmationValue?: string;
    title?: ReturnType<typeof localizationKeys>;
    subtitle?: ReturnType<typeof localizationKeys>;
    confirmButtonLabel?: ReturnType<typeof localizationKeys>;
  } = {},
) => {
  const onClose = props.onClose ?? vi.fn();
  const dialog = (values: typeof props) => (
    <CardStateProvider>
      <ResetConnectionDialog
        isOpen={values.isOpen ?? true}
        onClose={onClose}
        requestKey={values.requestKey ?? 'idn_connection_1'}
        canRun={() => true}
        confirmationValue={values.confirmationValue ?? 'Acme Inc'}
        onDelete={() => deleteConnection(values.requestKey ?? 'idn_connection_1')}
        contentRef={{ current: null }}
        title={values.title}
        subtitle={
          values.subtitle ?? localizationKeys('configureSSO.resetConnectionDialog.subtitle', { name: 'Acme SSO' })
        }
        confirmButtonLabel={values.confirmButtonLabel}
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
  deleteConnection.mockReset();
  deleteConnection.mockResolvedValue(undefined);
};

describe('ResetConnectionDialog', () => {
  it('requires fresh confirmation when the target changes with the same display name', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { userEvent, rerenderDialog } = renderDialog(wrapper);
    await userEvent.type(screen.getByLabelText(/below to continue/i), 'Acme Inc');
    rerenderDialog({ requestKey: 'idn_connection_2' });
    expect(screen.getByLabelText(/below to continue/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Reset connection' })).toBeDisabled();
  });

  it('clears confirmation when the required display value changes', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    const { userEvent, rerenderDialog } = renderDialog(wrapper);
    await userEvent.type(screen.getByLabelText(/below to continue/i), 'Acme Inc');
    rerenderDialog({ confirmationValue: 'Second organization' });
    expect(screen.getByLabelText(/below to continue/i)).toHaveValue('');
  });

  it('keeps an earlier completion from closing or settling a later target request', async () => {
    resetMocks();
    const earlier = createDeferredPromise<void>();
    const current = createDeferredPromise<void>();
    deleteConnection.mockReturnValueOnce(earlier.promise).mockReturnValueOnce(current.promise);
    const { wrapper } = await createFixtures();
    const { userEvent, rerenderDialog, onClose } = renderDialog(wrapper);
    await userEvent.type(screen.getByLabelText(/below to continue/i), 'Acme Inc');
    await userEvent.click(screen.getByRole('button', { name: 'Reset connection' }));
    rerenderDialog({ requestKey: 'idn_connection_2' });
    await userEvent.type(screen.getByLabelText(/below to continue/i), 'Acme Inc');
    const button = screen.getByRole('button', { name: 'Reset connection' });
    await userEvent.click(button);
    expect(deleteConnection).toHaveBeenLastCalledWith('idn_connection_2');
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
        /Are you sure you want to reset the connection "Acme SSO"\? This action is irreversible and you will have to configure all steps again/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset connection' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders override copy when title, subtitle, and confirm label props are supplied', async () => {
    resetMocks();
    const { wrapper } = await createFixtures();
    renderDialog(wrapper, {
      confirmationValue: 'Acme Inc',
      title: localizationKeys('organizationProfile.securityPage.removeDialog.title'),
      subtitle: localizationKeys('organizationProfile.securityPage.removeDialog.subtitle', { name: 'Acme SSO' }),
      confirmButtonLabel: localizationKeys('organizationProfile.securityPage.removeDialog.confirmButton'),
    });

    expect(screen.getByRole('heading', { name: 'Remove SSO connection' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Reset connection' })).not.toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to remove the connection "Acme SSO"\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove connection' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reset connection' })).not.toBeInTheDocument();
    // Type-to-confirm is unchanged by the override.
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
    expect(deleteConnection).not.toHaveBeenCalled();
  });

  it('resets the connection (delete + re-derive) and closes on a successful submit', async () => {
    resetMocks();
    const onClose = vi.fn();
    const { wrapper } = await createFixtures();
    const { userEvent } = renderDialog(wrapper, { confirmationValue: 'Acme Inc', onClose });

    await userEvent.type(screen.getByLabelText(/below to continue/i), 'Acme Inc');
    await userEvent.click(screen.getByRole('button', { name: 'Reset connection' }));

    await waitFor(() => {
      expect(deleteConnection).toHaveBeenCalledTimes(1);
    });
    expect(deleteConnection).toHaveBeenCalledWith('idn_connection_1');
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
