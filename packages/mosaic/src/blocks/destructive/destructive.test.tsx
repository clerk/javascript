import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../../components/button';
import { Menu } from '../../components/menu';
import { MosaicProvider } from '../../MosaicProvider';
import type { DestructiveControlledProps, DestructiveHandleProps } from './destructive';
import { Destructive } from './destructive';

vi.mock('../../features/reverification', () => ({
  Reverification: ({ phase }: { phase: string }) => <output data-testid='reverification'>{phase}</output>,
}));

function renderBlock(overrides: Partial<DestructiveControlledProps> = {}) {
  return render(
    <MosaicProvider>
      <Destructive
        open
        onOpenChange={vi.fn()}
        title='Delete account?'
        description='All of your data will be permanently deleted.'
        fieldLabel='Type “Delete account” below to continue'
        confirmationValue='Delete account'
        actionLabel='Delete account'
        onDelete={vi.fn()}
        {...overrides}
      />
    </MosaicProvider>,
  );
}

const confirmButton = () => screen.getByRole('button', { name: 'Delete account' });
const activeReverification = {
  status: 'loading' as const,
  phase: 'active' as const,
  onCancel: vi.fn(),
};

describe('Destructive', () => {
  it('renders nothing until the caller opens it', () => {
    renderBlock({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('asks to open from the trigger', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderBlock({ open: false, onOpenChange, trigger: <Button>Delete account</Button> });

    await user.click(confirmButton());

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('holds the action until the typed phrase matches', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    renderBlock({ onDelete });

    expect(confirmButton()).toHaveAttribute('aria-disabled', 'true');

    await user.type(screen.getByRole('textbox'), 'Delete accoun');
    expect(confirmButton()).toHaveAttribute('aria-disabled', 'true');

    await user.type(screen.getByRole('textbox'), 't');
    expect(confirmButton()).not.toHaveAttribute('aria-disabled');

    await user.click(confirmButton());
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('submits on enter in the confirmation field, once the typed phrase matches', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    renderBlock({ onDelete });

    await user.type(screen.getByRole('textbox'), 'Delete accoun{Enter}');
    expect(onDelete).not.toHaveBeenCalled();

    await user.type(screen.getByRole('textbox'), 't{Enter}');
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('asks to close from cancel', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderBlock({ onOpenChange });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('clears the typed phrase once the caller closes it', async () => {
    const user = userEvent.setup();
    const view = renderBlock();

    await user.type(screen.getByRole('textbox'), 'Delete account');
    view.rerender(
      <MosaicProvider>
        <Destructive
          open={false}
          onOpenChange={vi.fn()}
          title='Delete account?'
          description='All of your data will be permanently deleted.'
          fieldLabel='Type “Delete account” below to continue'
          confirmationValue='Delete account'
          actionLabel='Delete account'
          onDelete={vi.fn()}
        />
      </MosaicProvider>,
    );
    view.rerender(
      <MosaicProvider>
        <Destructive
          open
          onOpenChange={vi.fn()}
          title='Delete account?'
          description='All of your data will be permanently deleted.'
          fieldLabel='Type “Delete account” below to continue'
          confirmationValue='Delete account'
          actionLabel='Delete account'
          onDelete={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('marks the field invalid and explains a failed attempt', () => {
    renderBlock({ errorMessage: 'Your subscription is still active.' });

    expect(screen.getByText('Your subscription is still active.')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('stays inert while the caller is deleting', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    renderBlock({ isDeleting: true, onDelete });

    await user.type(screen.getByRole('textbox'), 'Delete account');

    expect(screen.getByRole('textbox')).toBeDisabled();
    // Busy, not unavailable: the block leaves the pending affordance to `isPending` rather than
    // disabling the action a second time.
    expect(confirmButton()).toHaveAttribute('aria-busy', 'true');
    await user.click(confirmButton());
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('shows reverification in the same dialog and card', () => {
    renderBlock({ isDeleting: true, reverification: activeReverification });

    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(document.querySelectorAll('.cl-card-root')).toHaveLength(1);
    expect(document.querySelector('.cl-flow-root')).toHaveAttribute('data-value', 'verify');
    expect(screen.getByTestId('reverification')).toHaveTextContent('active');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('cancels active reverification when the dialog closes', async () => {
    const cancel = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderBlock({
      isDeleting: true,
      onOpenChange,
      reverification: { ...activeReverification, onCancel: cancel },
    });

    await user.keyboard('{Escape}');

    expect(cancel).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('keeps the retrying factor visible until the hook becomes inactive', () => {
    const props = {
      open: true,
      onOpenChange: vi.fn(),
      title: 'Delete account?',
      description: 'All of your data will be permanently deleted.',
      fieldLabel: 'Type “Delete account” below to continue',
      confirmationValue: 'Delete account',
      actionLabel: 'Delete account',
      onDelete: vi.fn(),
    };
    const { rerender } = render(
      <MosaicProvider>
        <Destructive
          {...props}
          isDeleting
          reverification={{ status: 'loading', phase: 'retrying' }}
        />
      </MosaicProvider>,
    );

    rerender(
      <MosaicProvider>
        <Destructive
          {...props}
          errorMessage='Delete failed.'
          reverification={{ status: 'idle', phase: 'inactive' }}
        />
      </MosaicProvider>,
    );
    expect(document.querySelector('.cl-flow-root')).toHaveAttribute('data-value', 'confirm');
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Delete failed.')).toBeInTheDocument();
  });
});

function renderWithHandle(onDelete: DestructiveHandleProps<string>['onDelete']) {
  const handle = Destructive.createHandle<string>();
  render(
    <MosaicProvider>
      <Destructive
        handle={handle}
        title='Delete account?'
        description={name => <strong>{name} will be permanently deleted.</strong>}
        fieldLabel='Type the account name to continue'
        confirmationValue={name => name}
        actionLabel={name => `Delete ${name}`}
        onDelete={onDelete}
      />
    </MosaicProvider>,
  );
  act(() => handle.open('account'));
  return handle;
}

describe('Destructive with a handle', () => {
  it('shares one dialog between menu items and deletes the confirmed payload', async () => {
    const handle = Destructive.createHandle<{ id: string; name: string }>();
    const projects = [
      { id: 'project_1', name: 'Production' },
      { id: 'project_2', name: 'Staging' },
    ];
    const onDelete = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        {projects.map(project => (
          <Menu.Root key={project.id}>
            <Menu.Trigger render={<Button>Actions for {project.name}</Button>} />
            <Menu.Popup>
              <Menu.Item
                label='Delete'
                onClick={() => handle.open(project)}
              >
                <Menu.Label>Delete</Menu.Label>
              </Menu.Item>
            </Menu.Popup>
          </Menu.Root>
        ))}
        <Destructive
          handle={handle}
          title={project => `Delete ${project.name}?`}
          description={project => `${project.name} will be permanently deleted.`}
          fieldLabel={project => `Type ${project.name} to continue`}
          confirmationValue={project => project.name}
          actionLabel='Delete project'
          onDelete={onDelete}
        />
      </MosaicProvider>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const firstTrigger = screen.getByRole('button', { name: 'Actions for Production' });
    await user.click(firstTrigger);
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Delete Production?');
    await user.type(screen.getByRole('textbox'), 'Production');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(firstTrigger).toHaveFocus());

    const secondTrigger = screen.getByRole('button', { name: 'Actions for Staging' });
    secondTrigger.focus();
    await user.keyboard('{Enter}{Enter}');
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Delete Staging?');
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription('Staging will be permanently deleted.');
    expect(screen.getByRole('textbox', { name: 'Type Staging to continue' })).toHaveValue('');
    await user.type(screen.getByRole('textbox'), 'Stagin{Enter}');
    expect(onDelete).not.toHaveBeenCalled();
    await user.type(screen.getByRole('textbox'), 'g{Enter}');
    expect(onDelete).toHaveBeenCalledExactlyOnceWith({ id: 'project_2', name: 'Staging' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(secondTrigger).toHaveFocus();
  });

  it('keeps the dialog open and prevents duplicate submissions while deletion is pending', async () => {
    const deletion = createDeferredPromise();
    const onDelete = vi.fn(async () => {
      await deletion.promise;
    });
    const user = userEvent.setup();
    const handle = renderWithHandle(onDelete);

    await user.type(screen.getByRole('textbox'), 'account');
    await user.click(confirmButton());

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(confirmButton()).toHaveAttribute('aria-busy', 'true');
    await user.click(confirmButton());
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.keyboard('{Escape}');
    act(() => handle.close());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onDelete).toHaveBeenCalledExactlyOnceWith('account');

    await act(async () => {
      deletion.resolve();
      await deletion.promise;
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows a deletion failure, clears it on reopening, and allows retrying', async () => {
    const onDelete = vi
      .fn<DestructiveHandleProps<string>['onDelete']>()
      .mockRejectedValueOnce(new Error('The account still has active projects.'))
      .mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    const handle = renderWithHandle(onDelete);

    await user.type(screen.getByRole('textbox'), 'account{Enter}');
    expect(await screen.findByText('The account still has active projects.')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox')).toHaveValue('account');
    expect(confirmButton()).not.toHaveAttribute('aria-busy', 'true');

    act(() => handle.close());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    act(() => handle.open('account'));
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.queryByText('The account still has active projects.')).not.toBeInTheDocument();

    await user.type(screen.getByRole('textbox'), 'account{Enter}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onDelete).toHaveBeenCalledTimes(2);
  });
});
