import copy from 'copy-to-clipboard';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render } from '@/test/utils';

import { PaymentAttemptCopy } from '../../PaymentAttempts/payment-attempt-copy';
import { StatementCopyButton } from '../../Statements/statement-copy-button';

vi.mock('copy-to-clipboard', () => ({ default: vi.fn(() => true) }));
const { createFixtures } = bindCreateFixtures('UserProfile');
const cases = [
  { name: 'statement', Component: StatementCopyButton, text: 'statement_first', label: 'Copy statement ID' },
  { name: 'payment', Component: PaymentAttemptCopy, text: 'payment_first', label: 'Copy payment attempt ID' },
];

async function wrapper() {
  const fixture = await createFixtures(f => {
    f.withUser({ email_addresses: ['test@clerk.com'] });
  });
  return fixture.wrapper;
}

afterEach(() => {
  vi.useRealTimers();
  vi.mocked(copy).mockReset().mockReturnValue(true);
});

for (const { name, Component, text, label } of cases) {
  describe(`${name} copy button`, () => {
    it('copies the ID string and updates its accessible label', async () => {
      const { getByRole } = render(
        <Component
          text={text}
          copyLabel={label}
        />,
        { wrapper: await wrapper() },
      );
      fireEvent.click(getByRole('button', { name: label }));
      expect(copy).toHaveBeenCalledExactlyOnceWith(text, {});
      expect(getByRole('button', { name: 'Copied' })).toBeVisible();
    });

    it('copies the current ID after the component renders new text', async () => {
      const { getByRole, rerender } = render(
        <Component
          text={text}
          copyLabel={label}
        />,
        { wrapper: await wrapper() },
      );
      rerender(
        <Component
          text='next_id'
          copyLabel={label}
        />,
      );
      fireEvent.click(getByRole('button', { name: label }));
      expect(copy).toHaveBeenCalledExactlyOnceWith('next_id', {});
    });

    it('keeps the original label when copying fails', async () => {
      vi.mocked(copy).mockReturnValue(false);
      const { getByRole, queryByRole } = render(
        <Component
          text={text}
          copyLabel={label}
        />,
        { wrapper: await wrapper() },
      );
      fireEvent.click(getByRole('button', { name: label }));
      expect(getByRole('button', { name: label })).toBeVisible();
      expect(queryByRole('button', { name: 'Copied' })).not.toBeInTheDocument();
    });

    it('returns to the original label when feedback expires', async () => {
      const fixture = await wrapper();
      vi.useFakeTimers();
      const { getByRole } = render(
        <Component
          text={text}
          copyLabel={label}
        />,
        { wrapper: fixture },
      );
      fireEvent.click(getByRole('button', { name: label }));
      expect(getByRole('button', { name: 'Copied' })).toBeVisible();
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      expect(getByRole('button', { name: label })).toBeVisible();
    });

    it('releases the feedback timer when the button unmounts', async () => {
      const fixture = await wrapper();
      vi.useFakeTimers();
      const { getByRole, unmount } = render(
        <Component
          text={text}
          copyLabel={label}
        />,
        { wrapper: fixture },
      );
      const initialTimers = vi.getTimerCount();
      fireEvent.click(getByRole('button', { name: label }));
      expect(vi.getTimerCount()).toBe(initialTimers + 1);
      unmount();
      expect(vi.getTimerCount()).toBe(initialTimers);
    });
  });
}
