import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, cleanup, render, screen } from '@/test/utils';

import { AgentActionApproval } from '../AgentActionApproval';

const { createFixtures } = bindCreateFixtures('AgentActionApproval');

describe('AgentActionApproval', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders the interactive refund prototype without claiming an agent identity', async () => {
    await renderApproval();

    const pageTitle = screen.getByRole('heading', { name: 'Approve agent action', level: 2 });
    const requestMetadata = screen.getByText(/Requested 3 minutes ago/);
    const description = screen.getByText(
      'Refund the most recent charge after the customer reported a duplicate payment.',
    );
    const parameterLabel = screen.getByText('Refund amount');

    expect(screen.queryByText(/Codex/i)).not.toBeInTheDocument();
    expect(requestMetadata.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(description.compareDocumentPosition(parameterLabel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(pageTitle.compareDocumentPosition(requestMetadata) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText('$400.00')).toBeVisible();
    expect(screen.getByText('Cameron Walker')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Copy Payment intent' })).toHaveAttribute('data-variant', 'ghost');
    expect(screen.getByText('Optional')).toBeVisible();
    expect(screen.getByText(/Approval window closes in/)).toHaveStyle({ fontVariantNumeric: 'tabular-nums' });
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

  return render(<AgentActionApproval />, { wrapper: fixtureResult.wrapper });
}
