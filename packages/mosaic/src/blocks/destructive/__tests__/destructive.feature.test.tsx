import { reverificationError } from '@clerk/shared/authorization-errors';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../__tests__/async';
import { clerkApiError } from '../../../__tests__/clerk-errors';
import { openDialog } from '../../../__tests__/feature/dialog';
import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { Button } from '../../../components/button';
import { Menu } from '../../../components/menu';
import { useReverificationFlow } from '../../../features/reverification';
import type { ConfirmController, ConfirmControllerOptions } from '../../confirm';
import { useConfirmController } from '../../confirm';
import { Destructive } from '../destructive';

const session = fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) });
const TITLE = 'Delete account?';

function Host<Payload>({
  options,
  children,
}: {
  options: ConfirmControllerOptions<Payload>;
  children: (controller: ConfirmController<Payload>) => ReactNode;
}) {
  const controller = useConfirmController<Payload>(options);
  return <>{children(controller)}</>;
}

async function renderAccount(options: ConfirmControllerOptions<void>) {
  const ref: { current: ConfirmController | undefined } = { current: undefined };
  serveFapi({ client: fapiClient([session]) });
  await renderWithClerk(
    <Host<void> options={options}>
      {controller => {
        ref.current = controller;
        return (
          <Destructive
            controller={controller}
            trigger={<Button color='negative'>Delete my account</Button>}
            title={TITLE}
            description='All of your data will be permanently deleted.'
            fieldLabel='Type Delete to continue'
            confirmationValue='Delete'
            actionLabel='Delete account'
          />
        );
      }}
    </Host>,
  );
  const user = userEvent.setup();
  const open = () => openDialog(user, screen.getByRole('button', { name: 'Delete my account' }), { name: TITLE });
  const closed = () => waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  return { user, ref, open, closed };
}

const field = () => screen.getByRole('textbox');
const confirmButton = () => screen.getByRole('button', { name: 'Delete account' });

describe('Destructive', () => {
  it('focuses the field, holds the action until the phrase matches, and submits on Enter', async () => {
    const onConfirm = vi.fn(() => Promise.resolve());
    const { user, open, closed } = await renderAccount({ onConfirm });
    await open();

    await waitFor(() => expect(field()).toHaveFocus());
    expect(confirmButton()).toHaveAttribute('aria-disabled', 'true');

    await user.keyboard('Delet{Enter}');
    expect(onConfirm).not.toHaveBeenCalled();
    expect(confirmButton()).toHaveAttribute('aria-disabled', 'true');

    await user.keyboard('e');
    expect(confirmButton()).not.toHaveAttribute('aria-disabled');
    await user.keyboard('{Enter}');
    expect(onConfirm).toHaveBeenCalledOnce();
    await closed();
  });

  it('disables the field and ignores every way out while the action is pending', async () => {
    const run = deferred<void>();
    const onConfirm = vi.fn(() => run.promise);
    const { user, ref, open, closed } = await renderAccount({ onConfirm });
    await open();
    await user.type(field(), 'Delete{Enter}');

    expect(field()).toBeDisabled();
    expect(confirmButton()).toHaveAttribute('aria-busy', 'true');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.keyboard('{Escape}');
    act(() => ref.current?.onOpenChange(false));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onConfirm).toHaveBeenCalledOnce();

    run.resolve();
    await closed();
  });

  it('marks the field invalid and keeps the phrase on failure, starts the next open clean, and lets a retry succeed', async () => {
    const onConfirm = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(clerkApiError('subscription_active', 'Your subscription is still active.'))
      .mockResolvedValueOnce(undefined);
    const { user, open, closed } = await renderAccount({ onConfirm });
    await open();

    await user.type(field(), 'Delete{Enter}');

    expect(await screen.findByText('Your subscription is still active.')).toBeInTheDocument();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveValue('Delete');
    expect(confirmButton()).not.toHaveAttribute('aria-busy', 'true');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await closed();
    await open();
    expect(field()).toHaveValue('');
    expect(screen.queryByText('Your subscription is still active.')).toBeNull();

    await user.type(field(), 'Delete');
    await user.click(confirmButton());
    await closed();
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });
});

interface Project {
  id: string;
  name: string;
}

describe('Destructive shared by rows', () => {
  it('asks for each row its own phrase and starts every row with an empty field', async () => {
    const projects: Project[] = [
      { id: 'project_1', name: 'Production' },
      { id: 'project_2', name: 'Staging' },
    ];
    const onConfirm = vi.fn((_: Project) => Promise.resolve());
    serveFapi({ client: fapiClient([session]) });
    await renderWithClerk(
      <Host<Project> options={{ onConfirm }}>
        {controller => (
          <>
            {projects.map(project => (
              <Menu.Root key={project.id}>
                <Menu.Trigger render={<Button>Actions for {project.name}</Button>} />
                <Menu.Popup>
                  <Menu.Item
                    label='Delete'
                    onClick={() => controller.open(project)}
                  >
                    <Menu.Label>Delete</Menu.Label>
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Root>
            ))}
            <Destructive
              controller={controller}
              title={project => `Delete ${project.name}?`}
              description={project => `${project.name} will be permanently deleted.`}
              fieldLabel={project => `Type ${project.name} to continue`}
              confirmationValue={project => project.name}
              actionLabel='Delete project'
            />
          </>
        )}
      </Host>,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Actions for Production' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    expect(await screen.findByRole('dialog')).toHaveAccessibleName('Delete Production?');
    await user.type(screen.getByRole('textbox', { name: 'Type Production to continue' }), 'Production');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    await user.click(screen.getByRole('button', { name: 'Actions for Staging' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    expect(await screen.findByRole('dialog')).toHaveAccessibleName('Delete Staging?');
    const stagingField = screen.getByRole('textbox', { name: 'Type Staging to continue' });
    expect(stagingField).toHaveValue('');
    await user.type(stagingField, 'Production{Enter}');
    expect(onConfirm).not.toHaveBeenCalled();
    await user.clear(stagingField);
    await user.type(stagingField, 'Staging');
    await user.click(screen.getByRole('button', { name: 'Delete project' }));
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith(projects[1]);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});

function ReverifiedHost({ action }: { action: () => Promise<unknown> }) {
  const [run, reverification] = useReverificationFlow(action);
  const controller = useConfirmController({ onConfirm: run, reverification });

  return (
    <Destructive
      controller={controller}
      trigger={<Button color='negative'>Delete my account</Button>}
      title={TITLE}
      description='This action asks for verification first.'
      fieldLabel='Type Delete to continue'
      confirmationValue='Delete'
      actionLabel='Delete account'
    />
  );
}

describe('Destructive with reverification', () => {
  it('keeps the typed phrase through the verify step when the retried action fails', async () => {
    const action = vi
      .fn()
      .mockResolvedValueOnce(reverificationError())
      .mockRejectedValueOnce(clerkApiError('subscription_active', 'Your subscription is still active.'));
    serveFapi({
      client: fapiClient([session]),
      verification: { secrets: { password: 'hunter2' }, firstFactors: [{ strategy: 'password' as const }] },
    });
    await renderWithClerk(<ReverifiedHost action={action} />);
    const user = userEvent.setup();
    await openDialog(user, screen.getByRole('button', { name: 'Delete my account' }), { name: TITLE });
    await user.type(field(), 'Delete{Enter}');

    const password = await screen.findByLabelText('Password');
    await waitFor(() => expect(screen.queryByText(TITLE)).toBeNull());
    await user.type(password, 'hunter2{Enter}');

    expect(await screen.findByText('Your subscription is still active.')).toBeInTheDocument();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(field()).toHaveValue('Delete');
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(action).toHaveBeenCalledTimes(2);
  });
});
