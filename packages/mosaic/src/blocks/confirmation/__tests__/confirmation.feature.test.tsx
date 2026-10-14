import { reverificationError } from '@clerk/shared/authorization-errors';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../__tests__/async';
import { clerkApiError } from '../../../__tests__/clerk-errors';
import { openDialog } from '../../../__tests__/feature/dialog';
import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { Button } from '../../../components/button';
import { Menu } from '../../../components/menu';
import { useReverificationFlow } from '../../../features/reverification';
import type { MosaicLocalization } from '../../../localization';
import type { ConfirmController, ConfirmControllerOptions } from '../../confirm';
import { useConfirmController } from '../../confirm';
import { Confirmation } from '../confirmation';

type User = ReturnType<typeof userEvent.setup>;

const session = fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) });
const VERIFY = '/v1/client/sessions/sess_1/verify';
const TITLE = 'Remove connected account';

afterEach(() => {
  vi.restoreAllMocks();
});

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

async function renderAccount(
  options: ConfirmControllerOptions<void>,
  { localization, description }: { localization?: MosaicLocalization; description?: ReactNode } = {},
) {
  const ref: { current: ConfirmController | undefined } = { current: undefined };
  serveFapi({ client: fapiClient([session]) });
  await renderWithClerk(
    <Host<void> options={options}>
      {controller => {
        ref.current = controller;
        return (
          <Confirmation
            controller={controller}
            trigger={<Button color='negative'>Remove Google</Button>}
            title={TITLE}
            description={description ?? 'Google will be removed from this account.'}
            actionLabel='Remove'
          />
        );
      }}
    </Host>,
    undefined,
    localization,
  );
  const user = userEvent.setup();
  const trigger = () => screen.getByRole('button', { name: 'Remove Google' });
  const open = () => openDialog(user, trigger(), { role: 'alertdialog', name: TITLE });
  const closed = () => waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  return { user, ref, trigger, open, closed };
}

const confirmButton = () => screen.getByRole('button', { name: 'Remove' });

describe('Confirmation', () => {
  it('opens from its trigger, confirms, closes once the action lands, and hands focus back', async () => {
    const run = deferred<void>();
    const onConfirm = vi.fn(() => run.promise);
    const { user, trigger, open, closed } = await renderAccount({ onConfirm });
    expect(screen.queryByRole('alertdialog')).toBeNull();

    const dialog = await open();
    expect(dialog).toHaveAccessibleDescription('Google will be removed from this account.');

    await user.click(confirmButton());
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(confirmButton()).toHaveAttribute('aria-busy', 'true');

    run.resolve();
    await closed();
    expect(trigger()).toHaveFocus();
  });

  it('renders markup in the description', async () => {
    const { open } = await renderAccount(
      { onConfirm: () => Promise.resolve() },
      {
        description: (
          <>
            <strong>preston@clerk.dev</strong> will be removed from this account.
          </>
        ),
      },
    );

    const dialog = await open();

    expect(dialog).toHaveAccessibleDescription('preston@clerk.dev will be removed from this account.');
    expect(screen.getByText('preston@clerk.dev').tagName).toBe('STRONG');
  });

  it.each([
    ['Cancel', (user: User) => user.click(screen.getByRole('button', { name: 'Cancel' }))],
    ['Escape', (user: User) => user.keyboard('{Escape}')],
  ])('cancels from %s without running the action', async (_, dismiss) => {
    const onConfirm = vi.fn(() => Promise.resolve());
    const { user, open, closed } = await renderAccount({ onConfirm });
    await open();

    await dismiss(user);

    await closed();
    expect(onConfirm).not.toHaveBeenCalled();
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

  it('holds the dialog and ignores every way out while the action is pending', async () => {
    const run = deferred<void>();
    const onConfirm = vi.fn(() => run.promise);
    const { user, ref, open, closed } = await renderAccount({ onConfirm });
    await open();
    await user.click(confirmButton());
    expect(confirmButton()).toHaveAttribute('aria-busy', 'true');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.keyboard('{Escape}');
    await user.click(document.body);
    act(() => ref.current?.onOpenChange(false));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(onConfirm).toHaveBeenCalledOnce();

    run.resolve();
    await closed();
  });

  it('keeps the dialog open and explains a Clerk failure, then lets the retry succeed', async () => {
    const onConfirm = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(clerkApiError('connected_account_required', 'Google is your only way to sign in.'))
      .mockResolvedValueOnce(undefined);
    const { user, open, closed } = await renderAccount({ onConfirm });
    await open();

    await user.click(confirmButton());

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Google is your only way to sign in.'));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(confirmButton()).not.toHaveAttribute('aria-busy', 'true');

    await user.click(confirmButton());
    await closed();
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });

  it('shows the localized copy for the code a refusal carries', async () => {
    const { user, open } = await renderAccount(
      { onConfirm: () => Promise.reject(clerkApiError('action_blocked', 'Raw server sentence.')) },
      { localization: { overrides: { 'errors.action_blocked': 'Acción bloqueada.' } } },
    );
    await open();

    await user.click(confirmButton());

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Acción bloqueada.'));
  });

  it('shows the fallback for an error Clerk cannot describe', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { user, open } = await renderAccount({
      onConfirm: () => Promise.reject(new TypeError('Cannot read properties of undefined')),
      errorFallback: 'Unable to remove this account.',
    });
    await open();

    await user.click(confirmButton());

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to remove this account.'));
  });

  it('shows the generic error when no fallback is given', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { user, open } = await renderAccount({ onConfirm: () => Promise.reject(new Error('internal')) });
    await open();

    await user.click(confirmButton());

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.'));
  });

  it('starts the next open clean after a failure', async () => {
    const { user, open, closed } = await renderAccount({
      onConfirm: () => Promise.reject(clerkApiError('action_blocked', 'nope')),
    });
    await open();
    await user.click(confirmButton());
    await waitFor(() => expect(screen.getByRole('alert')).not.toBeEmptyDOMElement());

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await closed();
    await open();

    expect(screen.getByRole('alert').textContent).toBe('');
  });
});

interface Member {
  id: string;
  name: string;
}

describe('Confirmation shared by rows', () => {
  it('opens from any row with that row, derives its copy, confirms with it, and hands focus back', async () => {
    const members: Member[] = [
      { id: 'mem_1', name: 'Preston' },
      { id: 'mem_2', name: 'Jane' },
    ];
    const onConfirm = vi.fn((_: Member) => Promise.resolve());
    serveFapi({ client: fapiClient([session]) });
    await renderWithClerk(
      <Host<Member> options={{ onConfirm }}>
        {controller => (
          <>
            {members.map(member => (
              <Menu.Root key={member.id}>
                <Menu.Trigger render={<Button>Actions for {member.name}</Button>} />
                <Menu.Popup>
                  <Menu.Item
                    label='Remove'
                    onClick={() => controller.open(member)}
                  >
                    <Menu.Label>Remove</Menu.Label>
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Root>
            ))}
            <Confirmation
              controller={controller}
              title={member => `Remove ${member.name}?`}
              description={member => (
                <>
                  <strong>{member.name}</strong> will be removed from the organization.
                </>
              )}
              actionLabel='Remove member'
            />
          </>
        )}
      </Host>,
    );
    const user = userEvent.setup();
    expect(screen.queryByRole('alertdialog')).toBeNull();

    const firstTrigger = screen.getByRole('button', { name: 'Actions for Preston' });
    await user.click(firstTrigger);
    await user.click(await screen.findByRole('menuitem', { name: 'Remove' }));
    expect(await screen.findByRole('alertdialog')).toHaveAccessibleName('Remove Preston?');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await waitFor(() => expect(firstTrigger).toHaveFocus());

    const secondTrigger = screen.getByRole('button', { name: 'Actions for Jane' });
    await user.click(secondTrigger);
    await user.click(await screen.findByRole('menuitem', { name: 'Remove' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveAccessibleName('Remove Jane?');
    expect(dialog).toHaveAccessibleDescription('Jane will be removed from the organization.');
    expect(screen.getByText('Jane').tagName).toBe('STRONG');
    await user.click(screen.getByRole('button', { name: 'Remove member' }));
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith(members[1]);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(secondTrigger).toHaveFocus();
  });
});

function ReverifiedHost({
  action,
  cleanupMs,
  settleMs,
  beforeRunMs,
}: {
  action: () => Promise<unknown>;
  cleanupMs?: number;
  settleMs?: number;
  beforeRunMs?: number;
}) {
  const [run, reverification] = useReverificationFlow(action);
  const controller = useConfirmController({
    onConfirm: async () => {
      if (beforeRunMs !== undefined) {
        await new Promise(resolve => setTimeout(resolve, beforeRunMs));
      }
      try {
        const result = await run();
        if (settleMs !== undefined) {
          await new Promise(resolve => setTimeout(resolve, settleMs));
        }
        return result;
      } catch (error) {
        if (cleanupMs !== undefined) {
          await new Promise(resolve => setTimeout(resolve, cleanupMs));
        }
        throw error;
      }
    },
    reverification,
  });

  return (
    <>
      <output aria-label='Outcome'>{controller.isOpen ? 'open' : 'closed'}</output>
      <Confirmation
        controller={controller}
        trigger={<Button color='negative'>Remove Google</Button>}
        title={TITLE}
        description='This action asks for verification first.'
        actionLabel='Remove'
      />
    </>
  );
}

const passwordVerification = {
  client: fapiClient([session]),
  verification: { secrets: { password: 'hunter2' }, firstFactors: [{ strategy: 'password' as const }] },
};

async function renderReverified(props: Parameters<typeof ReverifiedHost>[0]) {
  await renderWithClerk(<ReverifiedHost {...props} />);
  return { user: userEvent.setup() };
}

async function confirmIntoVerification(user: User) {
  await openDialog(user, screen.getByRole('button', { name: 'Remove Google' }), { role: 'alertdialog', name: TITLE });
  await user.click(confirmButton());
}

async function untilConfirmStepIsGone() {
  await waitFor(() => expect(screen.queryByText(TITLE)).toBeNull());
}

function watchForConfirmStep() {
  const log: string[] = [];
  const inspect = (records: MutationRecord[]) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.textContent?.includes(TITLE)) {
          log.push(`added: ${(node as Element).outerHTML?.slice(0, 120) ?? node.textContent}`);
        }
      }
    }
  };
  const observer = new MutationObserver(inspect);
  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    inspect(observer.takeRecords());
    observer.disconnect();
    return log;
  };
}

const interruptedOnce = () => vi.fn().mockResolvedValueOnce(reverificationError()).mockResolvedValue({ done: true });

describe('Confirmation with reverification', () => {
  it('keeps the confirm step pending while the challenge starts, then swaps in the factor card', async () => {
    serveFapi(passwordVerification);
    const { user } = await renderReverified({ action: interruptedOnce() });
    const start = holdRequests('post', VERIFY);

    await confirmIntoVerification(user);

    expect(screen.getByText(TITLE)).toBeVisible();
    expect(confirmButton()).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByLabelText('Password')).toBeNull();

    start.release();
    expect(await screen.findByLabelText('Password')).toBeVisible();
    expect(screen.getAllByRole('alertdialog')).toHaveLength(1);
    await untilConfirmStepIsGone();
  });

  it('closes from the error card without going back to the confirm step', async () => {
    serveFapi({ client: fapiClient([session]) });
    const { user } = await renderReverified({ action: interruptedOnce(), cleanupMs: 400 });
    holdRequests('post', VERIFY).fail('some_new_error', 'Nope');

    await confirmIntoVerification(user);

    expect(await screen.findByText('Something went wrong')).toBeVisible();
    await untilConfirmStepIsGone();
    const stopWatching = watchForConfirmStep();
    const buttons = screen.getAllByRole('button', { name: 'Close' });
    await user.click(buttons[buttons.length - 1]);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(stopWatching()).toEqual([]);
    expect(screen.getByLabelText('Outcome')).toHaveTextContent('closed');
  });

  for (const cleanupMs of [undefined, 400]) {
    it(`closes from the factor card's corner dismiss without going back to the confirm step (host cleans up after ${cleanupMs ?? 0}ms)`, async () => {
      serveFapi(passwordVerification);
      const { user } = await renderReverified({ action: interruptedOnce(), cleanupMs });
      await confirmIntoVerification(user);

      expect(await screen.findByLabelText('Password')).toBeVisible();
      await untilConfirmStepIsGone();
      const stopWatching = watchForConfirmStep();
      await user.click(screen.getAllByRole('button', { name: 'Close' })[0]);
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
      expect(stopWatching()).toEqual([]);
      expect(screen.getByLabelText('Outcome')).toHaveTextContent('closed');
    });
  }

  for (const settleMs of [undefined, 400]) {
    it(`does not go back to the confirm step after a successful verification (host settles after ${settleMs ?? 0}ms)`, async () => {
      serveFapi(passwordVerification);
      const { user } = await renderReverified({ action: interruptedOnce(), settleMs });
      await confirmIntoVerification(user);

      const field = await screen.findByLabelText('Password');
      await untilConfirmStepIsGone();
      const stopWatching = watchForConfirmStep();
      await user.type(field, 'hunter2{Enter}');
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull(), { timeout: 3000 });
      expect(stopWatching()).toEqual([]);
      expect(screen.getByLabelText('Outcome')).toHaveTextContent('closed');
    });
  }

  it('cannot be closed while the verified action is retrying, and withholds the corner dismiss', async () => {
    const retry = deferred<{ done: true }>();
    const action = vi.fn().mockResolvedValueOnce(reverificationError()).mockReturnValueOnce(retry.promise);
    serveFapi(passwordVerification);
    const { user } = await renderReverified({ action });
    await confirmIntoVerification(user);
    const field = await screen.findByLabelText('Password');

    await user.type(field, 'hunter2{Enter}');
    await waitFor(() => expect(action).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    await user.keyboard('{Escape}');
    await user.click(document.body);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Outcome')).toHaveTextContent('open');

    retry.resolve({ done: true });
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('does not show the previous attempt again when the host starts the next run after a delay', async () => {
    const action = vi
      .fn()
      .mockResolvedValueOnce(reverificationError())
      .mockResolvedValueOnce(reverificationError())
      .mockResolvedValue({ done: true });
    serveFapi(passwordVerification);
    const { user } = await renderReverified({ action, beforeRunMs: 400 });
    await confirmIntoVerification(user);
    expect(await screen.findByLabelText('Password')).toBeVisible();
    await user.click(screen.getAllByRole('button', { name: 'Close' })[0]);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());

    await openDialog(user, screen.getByRole('button', { name: 'Remove Google' }), { role: 'alertdialog', name: TITLE });
    const stopWatching = watchForConfirmStep();
    await user.click(confirmButton());
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(screen.queryByLabelText('Password')).toBeNull();
    expect(await screen.findByLabelText('Password', undefined, { timeout: 3000 })).toBeVisible();
    expect(stopWatching()).toEqual([]);
  });
});
