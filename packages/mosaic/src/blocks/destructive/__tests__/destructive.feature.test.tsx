import { reverificationError } from '@clerk/shared/authorization-errors';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../__tests__/async';
import { clerkApiError } from '../../../__tests__/clerk-errors';
import { openDialog } from '../../../__tests__/feature/dialog';
import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { openMenu } from '../../../__tests__/feature/menu';
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
  const open = () =>
    openDialog(user, screen.getByRole('button', { name: 'Delete my account' }), { role: 'alertdialog', name: TITLE });
  const closed = () => waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
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
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(onConfirm).toHaveBeenCalledOnce();

    run.resolve();
    await closed();
  });

  it('is an alert dialog: no corner dismiss, and an outside press leaves it open', async () => {
    const onConfirm = vi.fn(() => Promise.resolve());
    const { user, open } = await renderAccount({ onConfirm });
    const dialog = await open();
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();

    await user.click(document.body);

    expect(dialog).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
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

    await openMenu(user, screen.getByRole('button', { name: 'Actions for Production' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(await screen.findByRole('alertdialog')).toHaveAccessibleName('Delete Production?');
    await user.type(screen.getByRole('textbox', { name: 'Type Production to continue' }), 'Production');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());

    await openMenu(user, screen.getByRole('button', { name: 'Actions for Staging' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(await screen.findByRole('alertdialog')).toHaveAccessibleName('Delete Staging?');
    const stagingField = screen.getByRole('textbox', { name: 'Type Staging to continue' });
    expect(stagingField).toHaveValue('');
    await user.type(stagingField, 'Production{Enter}');
    expect(onConfirm).not.toHaveBeenCalled();
    await user.clear(stagingField);
    await user.type(stagingField, 'Staging');
    await user.click(screen.getByRole('button', { name: 'Delete project' }));
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith(projects[1]);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });
});

function ReverifiedHost({ action, before }: { action: () => Promise<unknown>; before?: () => Promise<void> }) {
  const [run, reverification] = useReverificationFlow(action);
  const controller = useConfirmController({
    onConfirm: before
      ? async () => {
          await before();
          await run();
        }
      : run,
    reverification,
  });

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
    await openDialog(user, screen.getByRole('button', { name: 'Delete my account' }), {
      role: 'alertdialog',
      name: TITLE,
    });
    await user.type(field(), 'Delete{Enter}');

    const password = await screen.findByLabelText('Password');
    await waitFor(() => expect(screen.queryByText(TITLE)).toBeNull());
    await user.type(password, 'hunter2{Enter}');

    expect(await screen.findByText('Your subscription is still active.')).toBeInTheDocument();
    expect(screen.getAllByRole('alertdialog')).toHaveLength(1);
    expect(field()).toHaveValue('Delete');
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(action).toHaveBeenCalledTimes(2);
  });
});

function recordFrames() {
  const frames: string[] = [];
  const frame = () => {
    const dialog = document.querySelector('[role="alertdialog"]');
    if (!dialog) {
      return 'gone';
    }
    const step = dialog.querySelector('.cl-flow-root')?.getAttribute('data-value') ?? 'none';
    return `${step}/${dialog.hasAttribute('data-open') ? 'open' : 'closing'}`;
  };
  const push = () => {
    const current = frame();
    if (frames.at(-1) !== current) {
      frames.push(current);
    }
  };
  const observer = new MutationObserver(push);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['data-value', 'data-open', 'data-closed'],
  });
  push();
  return { frames, stop: () => observer.disconnect() };
}

const VERIFY = '/v1/client/sessions/sess_1/verify';

describe('Destructive with reverification frames', () => {
  async function renderReverified(action: () => Promise<unknown>, before?: () => Promise<void>) {
    serveFapi({
      client: fapiClient([session]),
      verification: { secrets: { password: 'hunter2' }, firstFactors: [{ strategy: 'password' as const }] },
    });
    await renderWithClerk(
      <ReverifiedHost
        action={action}
        before={before}
      />,
    );
    const user = userEvent.setup();
    const open = () =>
      openDialog(user, screen.getByRole('button', { name: 'Delete my account' }), {
        role: 'alertdialog',
        name: TITLE,
      });
    const closed = () => waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    return { user, open, closed };
  }

  it('closes from the verify step when the retried action succeeds', async () => {
    const action = vi.fn().mockResolvedValueOnce(reverificationError()).mockResolvedValue({ done: true });
    const { user, open, closed } = await renderReverified(action);
    await open();
    await user.type(field(), 'Delete{Enter}');
    const password = await screen.findByLabelText('Password');
    await waitFor(() => expect(screen.queryByText(TITLE)).toBeNull());

    const recorder = recordFrames();
    await user.type(password, 'hunter2{Enter}');
    await closed();
    recorder.stop();

    expect(action).toHaveBeenCalledTimes(2);
    expect(recorder.frames[0]).toBe('verify/open');
    expect(recorder.frames).not.toContain('confirm/open');
  });

  it('closes from the verify step when the challenge is cancelled', async () => {
    const action = vi.fn().mockResolvedValue(reverificationError());
    const { user, open, closed } = await renderReverified(action);
    await open();
    await user.type(field(), 'Delete{Enter}');
    await screen.findByLabelText('Password');
    await waitFor(() => expect(screen.queryByText(TITLE)).toBeNull());

    const recorder = recordFrames();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await closed();
    recorder.stop();

    expect(recorder.frames[0]).toBe('verify/open');
    expect(recorder.frames).not.toContain('confirm/open');
  });

  it('shows the confirm step until the next challenge is ready when confirming again after a cancel', async () => {
    const action = vi.fn().mockResolvedValue(reverificationError());
    const { user, open, closed } = await renderReverified(action);
    await open();
    await user.type(field(), 'Delete{Enter}');
    await screen.findByLabelText('Password');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await closed();

    await open();
    const verify = holdRequests('post', VERIFY);
    const recorder = recordFrames();
    await user.type(field(), 'Delete{Enter}');
    await waitFor(() => expect(verify.requests).toHaveLength(1));
    expect(recorder.frames).toEqual(['confirm/open']);
    verify.release();

    await screen.findByLabelText('Password');
    recorder.stop();
    expect(recorder.frames).toEqual(['confirm/open', 'verify/open']);
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('shows the confirm step while an action does other work before the run, after a cancel', async () => {
    const action = vi.fn().mockResolvedValue(reverificationError());
    const gates = [deferred<void>(), deferred<void>()];
    const { user, open, closed } = await renderReverified(action, () => gates[action.mock.calls.length].promise);
    await open();
    await user.type(field(), 'Delete{Enter}');
    gates[0].resolve();
    await screen.findByLabelText('Password');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await closed();

    await open();
    const recorder = recordFrames();
    await user.type(field(), 'Delete{Enter}');
    await waitFor(() => expect(screen.getByRole('alertdialog').querySelector('[aria-busy="true"]')).not.toBeNull());
    expect(recorder.frames).toEqual(['confirm/open']);
    gates[1].resolve();

    await screen.findByLabelText('Password');
    recorder.stop();
    expect(recorder.frames).toEqual(['confirm/open', 'verify/open']);
  });
});
