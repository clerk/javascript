import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { UserProfileConnectedAccountRowView } from '../user-profile-connected-account-row.view';
import type { UserProfileConnectedAccount } from '../user-profile-connected-accounts-section.types';

type Animated = { getAnimations?: () => Animation[] };

function holdExits() {
  const exit = createDeferredPromise();
  (Element.prototype as Animated).getAnimations = () => [{ finished: exit.promise } as Animation];
  return exit;
}

const account: UserProfileConnectedAccount = {
  id: 'google',
  provider: 'Google',
  identifier: 'ada@example.com',
  status: 'connected',
};

describe('UserProfileConnectedAccountRowView', () => {
  afterEach(() => {
    delete (Element.prototype as Animated).getAnimations;
  });

  it('shows a first-load identifier without an entrance', () => {
    render(<UserProfileConnectedAccountRowView account={account} />);

    const description = screen.getByText('ada@example.com').closest('.cl-section-description');
    expect(description).toHaveAttribute('data-open');
    expect(description).not.toHaveAttribute('data-starting-style');
    expect(description).toHaveAttribute('title', 'ada@example.com');
  });

  it('expands the identifier when it arrives', () => {
    const { rerender } = render(<UserProfileConnectedAccountRowView account={{ ...account, identifier: undefined }} />);
    expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument();

    rerender(<UserProfileConnectedAccountRowView account={account} />);
    expect(screen.getByText('ada@example.com').closest('.cl-section-description')).toHaveAttribute(
      'data-starting-style',
    );
  });

  it('holds the identifier through its exit once it is removed', async () => {
    const exit = holdExits();
    const { rerender } = render(<UserProfileConnectedAccountRowView account={account} />);

    rerender(<UserProfileConnectedAccountRowView account={{ ...account, identifier: undefined }} />);
    const description = screen.getByText('ada@example.com').closest('.cl-section-description');
    expect(description).toHaveAttribute('data-ending-style');
    expect(description).toHaveAttribute('aria-hidden', 'true');

    await act(async () => {
      exit.resolve();
      await exit.promise;
    });
    expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument();
  });
});
