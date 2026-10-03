import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, cleanup, render, screen, waitFor } from '@/test/utils';

import { AgentActionApproval } from '../AgentActionApproval';

const { createFixtures } = bindCreateFixtures('AgentActionApproval');

describe('AgentActionApproval', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders the interactive refund prototype without claiming an agent identity', async () => {
    await renderApproval();

    expect(screen.getByRole('heading', { name: 'Approve agent action', level: 2 })).toBeVisible();
    expect(screen.getByText(/Requested 3 minutes ago/)).toBeVisible();
    expect(
      screen.getByText('Refund the most recent charge after the customer reported a duplicate payment.'),
    ).toBeVisible();
    expect(screen.getByText('Refund amount')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Copy Payment intent' })).toBeVisible();
    expect(screen.getByText('Optional')).toBeVisible();
    expect(screen.getByText(/Approval window closes in/)).toBeVisible();
    expect(screen.queryByText(/Codex/i)).not.toBeInTheDocument();
  });

  it.each([
    { button: 'Approve', heading: 'Action approved' },
    { button: 'Deny', heading: 'Action denied' },
  ])('renders the terminal state after $button', async ({ button, heading }) => {
    const { userEvent } = await renderApproval();

    await userEvent.click(screen.getByRole('button', { name: button }));

    expect(screen.getByRole('heading', { name: heading, level: 2 })).toBeVisible();
    expect(screen.getByText(/You can close this window/)).toBeVisible();
  });

  it('switches mock accounts without exposing unavailable request details or activating a real session', async () => {
    const { userEvent, clerk } = await renderApproval();

    await userEvent.type(screen.getByRole('textbox', { name: 'Comment' }), 'Entered as Alex');
    await userEvent.click(screen.getByRole('button', { name: 'Switch account' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /Jordan Lee/ }));

    expect(screen.getByRole('heading', { name: 'This request is unavailable' })).toBeVisible();
    expect(screen.getByText('Signed in as jordan@example.com')).toBeVisible();
    expect(screen.queryByText(/Refund the most recent charge/)).not.toBeInTheDocument();
    expect(screen.queryByText('Cameron Walker')).not.toBeInTheDocument();
    expect(screen.queryByText('$400.00')).not.toBeInTheDocument();
    expect(screen.queryByText(/Requested \d/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Approval window closes in/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Deny' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Comment' })).not.toBeInTheDocument();
    expect(screen.queryByText('Acme')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Switch account' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /Alex Morgan/ }));

    expect(screen.getByRole('heading', { name: 'Approve agent action' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Comment' })).toHaveValue('');
    expect(clerk.setActive).not.toHaveBeenCalled();
  });

  it('renders the selected workspace response without changing the action', async () => {
    const { userEvent, clerk } = await renderApproval();

    await userEvent.click(screen.getByRole('button', { name: 'Workspace' }));
    await userEvent.click(await screen.findByRole('option', { name: /Northstar/ }));

    expect(screen.getByRole('heading', { name: 'This request is unavailable' })).toBeVisible();
    expect(screen.queryByText('Refund amount')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Workspace' }));
    await userEvent.click(await screen.findByRole('option', { name: /Acme/ }));

    expect(screen.getByText('$400.00')).toBeVisible();
    expect(screen.getByText('Cameron Walker')).toBeVisible();
    expect(clerk.setActive).not.toHaveBeenCalled();
  });

  it('supports keyboard account selection and returns focus to the switcher', async () => {
    const { userEvent } = await renderApproval();
    const switcher = screen.getByRole('button', { name: 'Switch account' });

    switcher.focus();
    await userEvent.keyboard('{ArrowDown}');
    await screen.findByRole('menu');
    await userEvent.keyboard('{Escape}');

    expect(switcher).toHaveFocus();
    expect(screen.getByText('Signed in as alex@example.com')).toBeVisible();

    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /Jordan Lee/ })).toHaveFocus());
    await userEvent.keyboard('{Enter}');

    expect(screen.getByText('Signed in as jordan@example.com')).toBeVisible();
    expect(switcher).toHaveFocus();
  });

  it('keeps the original deadline while a request is unavailable', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-08-25T12:00:00Z'));
    const { userEvent } = await renderApproval();

    await userEvent.click(screen.getByRole('button', { name: 'Switch account' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /Jordan Lee/ }));

    act(() => {
      vi.advanceTimersByTime(15 * 60 * 1_000);
    });

    expect(screen.getByRole('heading', { name: 'This request is unavailable' })).toBeVisible();
    expect(screen.queryByText('Approval window closed')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Switch account' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /Alex Morgan/ }));

    expect(screen.getByRole('heading', { name: 'Approval window closed' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
  });

  it('closes the mock approval window when the countdown expires', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-08-25T12:00:00Z'));
    await renderApproval();

    act(() => {
      vi.advanceTimersByTime(15 * 60 * 1_000);
    });

    expect(screen.getByRole('heading', { name: 'Approval window closed' })).toBeVisible();
  });
});

async function renderApproval() {
  const fixtureResult = await createFixtures();
  fixtureResult.props.setProps({ componentName: 'AgentActionApproval' });

  return {
    ...render(<AgentActionApproval />, { wrapper: fixtureResult.wrapper }),
    clerk: fixtureResult.fixtures.clerk,
  };
}
