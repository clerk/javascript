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

  it('renders the interactive Codex refund prototype', async () => {
    const { container } = await renderApproval();

    const pageTitle = screen.getByRole('heading', { name: 'Approve agent action' });
    const divider = container.querySelector('.cl-dividerRow');
    const operation = screen.getByRole('heading', { name: 'Create a refund', level: 2 });
    const requestMetadata = screen.getByText(/Requested by Codex ·/);
    const description = screen.getByText(
      'Refund the most recent charge after the customer reported a duplicate payment.',
    );
    const parameterLabel = screen.getByText('Refund amount');

    expect(divider).not.toBeNull();
    expect(divider?.querySelector('.cl-dividerText')).toBeNull();
    expect(pageTitle.compareDocumentPosition(divider) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(divider?.compareDocumentPosition(operation) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(requestMetadata).toHaveAttribute('data-variant', 'caption');
    expect(operation.compareDocumentPosition(requestMetadata) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(requestMetadata.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(description.compareDocumentPosition(parameterLabel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText('$250.00')).toBeVisible();
    expect(screen.getByText(/Approval window closes in/)).toHaveStyle({ fontVariantNumeric: 'tabular-nums' });
  });

  it.each([
    { button: 'Approve', heading: 'Agent is now authorized to continue' },
    { button: 'Reject', heading: 'Action rejected' },
  ])('renders the terminal state after $button', async ({ button, heading }) => {
    const { userEvent } = await renderApproval();

    await userEvent.click(screen.getByRole('button', { name: button }));

    expect(screen.getByRole('heading', { name: heading })).toBeVisible();
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
