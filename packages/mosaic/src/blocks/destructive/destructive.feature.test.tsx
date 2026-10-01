import { reverificationError } from '@clerk/shared/authorization-errors';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { fapiUrl, serveFapi, worker } from '../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../__tests__/feature/fapi';
import { renderWithClerk } from '../../__tests__/feature/render';
import { useReverificationFlow } from '../../features/reverification';
import { Destructive } from './destructive';
import { useDestructiveController } from './destructive.controller';

const session = fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) });

const CONFIRM_TITLE = 'Delete account?';
const VERIFY = '/v1/client/sessions/sess_1/verify';

function Host({
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
  const controller = useDestructiveController({
    onDelete: async () => {
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
      <button
        type='button'
        onClick={controller.openDestructiveDialog}
      >
        Open
      </button>
      <output aria-label='Outcome'>{controller.open ? 'open' : 'closed'}</output>
      <Destructive
        {...controller}
        title={CONFIRM_TITLE}
        description='All of your data will be permanently deleted.'
        fieldLabel='Type Delete to continue'
        confirmationValue='Delete'
        actionLabel='Delete account'
      />
    </>
  );
}

async function openVerification() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Open' }));
  await user.type(await screen.findByRole('textbox'), 'Delete');
  await user.click(screen.getByRole('button', { name: 'Delete account' }));
  return { user };
}

async function untilConfirmStepIsGone() {
  await waitFor(() => expect(screen.queryByText(CONFIRM_TITLE)).toBeNull());
}

function watchForConfirmStep() {
  const log: string[] = [];
  const inspect = (records: MutationRecord[]) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.textContent?.includes(CONFIRM_TITLE)) {
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

const passwordVerification = {
  client: fapiClient([session]),
  verification: { secrets: { password: 'hunter2' }, firstFactors: [{ strategy: 'password' as const }] },
};

describe('Destructive with reverification', () => {
  it('closes from the error card without going back to the confirm step', async () => {
    const action = vi.fn().mockResolvedValueOnce(reverificationError()).mockResolvedValue({ done: true });
    serveFapi({ client: fapiClient([session]) });
    await renderWithClerk(
      <Host
        action={action}
        cleanupMs={400}
      />,
    );
    worker.use(
      http.post(fapiUrl(VERIFY), () =>
        HttpResponse.json({ errors: [{ code: 'some_new_error', message: 'Nope' }] }, { status: 400 }),
      ),
    );
    const { user } = await openVerification();

    expect(await screen.findByText('Something went wrong')).toBeVisible();
    const buttons = screen.getAllByRole('button', { name: 'Close' });
    await untilConfirmStepIsGone();
    const stopWatching = watchForConfirmStep();
    await user.click(buttons[buttons.length - 1]);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(stopWatching()).toEqual([]);

    expect(screen.getByLabelText('Outcome')).toHaveTextContent('closed');
  });

  for (const cleanupMs of [undefined, 400]) {
    it(`closes from the factor card without going back to the confirm step (host cleans up after ${cleanupMs ?? 0}ms)`, async () => {
      const action = vi.fn().mockResolvedValueOnce(reverificationError()).mockResolvedValue({ done: true });
      serveFapi(passwordVerification);
      await renderWithClerk(
        <Host
          action={action}
          cleanupMs={cleanupMs}
        />,
      );
      const { user } = await openVerification();

      expect(await screen.findByLabelText('Password')).toBeVisible();
      await untilConfirmStepIsGone();
      const stopWatching = watchForConfirmStep();
      await user.click(screen.getAllByRole('button', { name: 'Close' })[0]);
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(stopWatching()).toEqual([]);

      expect(screen.getByLabelText('Outcome')).toHaveTextContent('closed');
    });
  }

  for (const settleMs of [undefined, 400]) {
    it(`does not go back to the confirm step after a successful verification (host settles after ${settleMs ?? 0}ms)`, async () => {
      const action = vi.fn().mockResolvedValueOnce(reverificationError()).mockResolvedValue({ done: true });
      serveFapi(passwordVerification);
      await renderWithClerk(
        <Host
          action={action}
          settleMs={settleMs}
        />,
      );
      const { user } = await openVerification();

      const field = await screen.findByLabelText('Password');
      await untilConfirmStepIsGone();
      const stopWatching = watchForConfirmStep();
      await user.type(field, 'hunter2{Enter}');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 3000 });
      expect(stopWatching()).toEqual([]);

      expect(screen.getByLabelText('Outcome')).toHaveTextContent('closed');
    });
  }

  it('does not show the previous attempt again when the host starts the next run after a delay', async () => {
    const action = vi
      .fn()
      .mockResolvedValueOnce(reverificationError())
      .mockResolvedValueOnce(reverificationError())
      .mockResolvedValue({ done: true });
    serveFapi(passwordVerification);
    await renderWithClerk(
      <Host
        action={action}
        beforeRunMs={400}
      />,
    );
    const { user } = await openVerification();
    expect(await screen.findByLabelText('Password')).toBeVisible();
    await user.click(screen.getAllByRole('button', { name: 'Close' })[0]);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.type(await screen.findByRole('textbox'), 'Delete');
    const stopWatching = watchForConfirmStep();
    await user.click(screen.getByRole('button', { name: 'Delete account' }));
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(screen.queryByLabelText('Password')).toBeNull();
    expect(await screen.findByLabelText('Password', undefined, { timeout: 3000 })).toBeVisible();
    expect(stopWatching()).toEqual([]);
  });
});
