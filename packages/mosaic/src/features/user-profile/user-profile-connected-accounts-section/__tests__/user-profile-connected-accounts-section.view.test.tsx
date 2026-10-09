import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type {
  UserProfileConnectedAccount,
  UserProfileConnectionProvider,
} from '../user-profile-connected-accounts-section.types';
import { UserProfileConnectedAccountsSectionView } from '../user-profile-connected-accounts-section.view';

type Animated = { getAnimations?: () => Animation[] };

function holdExits() {
  const exit = createDeferredPromise();
  (Element.prototype as Animated).getAnimations = () => [{ finished: exit.promise } as Animation];
  return exit;
}

const google: UserProfileConnectionProvider = { id: 'oauth_google', provider: 'Google' };
const connectedGoogle: UserProfileConnectedAccount = {
  id: 'idn_google',
  providerId: 'oauth_google',
  provider: 'Google',
  identifier: 'ada@example.com',
  status: 'connected',
};
const connectedGithub: UserProfileConnectedAccount = {
  id: 'idn_github',
  providerId: 'oauth_github',
  provider: 'GitHub',
  identifier: 'ada',
  status: 'connected',
};

const rowOf = (name: string) => screen.getByText(name).closest<HTMLElement>('.cl-section-row');
const rowNames = () =>
  Array.from(document.querySelectorAll('.cl-section-row .cl-section-label')).map(label => label.textContent);

describe('UserProfileConnectedAccountsSectionView', () => {
  afterEach(() => {
    delete (Element.prototype as Animated).getAnimations;
  });

  it('lists connected accounts before providers to connect', () => {
    render(
      <UserProfileConnectedAccountsSectionView
        accounts={[connectedGithub]}
        availableProviders={[google]}
        onConnect={vi.fn()}
      />,
    );

    expect(rowNames()).toEqual(['GitHub', 'Google']);
    expect(screen.getByRole('button', { name: 'Connect Google' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Manage/ })).not.toBeInTheDocument();
  });

  it('connects a provider in its own row, expanding the identifier', () => {
    const { rerender } = render(
      <UserProfileConnectedAccountsSectionView
        accounts={[connectedGithub]}
        availableProviders={[google]}
        onConnect={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    const row = rowOf('Google');

    rerender(
      <UserProfileConnectedAccountsSectionView
        accounts={[connectedGithub, connectedGoogle]}
        availableProviders={[]}
        onConnect={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(rowOf('Google')).toBe(row);
    expect(rowNames()).toEqual(['GitHub', 'Google']);
    expect(row).not.toHaveAttribute('data-starting-style');
    expect(screen.getByText('ada@example.com').closest('.cl-section-description')).toHaveAttribute(
      'data-starting-style',
    );
    expect(within(row as HTMLElement).getByRole('button', { name: 'Manage Google' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect Google' })).not.toBeInTheDocument();
  });

  it('keeps a connected provider in place when the model lists it first', () => {
    const { rerender } = render(
      <UserProfileConnectedAccountsSectionView
        accounts={[connectedGithub]}
        availableProviders={[google]}
        onConnect={vi.fn()}
      />,
    );

    rerender(
      <UserProfileConnectedAccountsSectionView
        accounts={[connectedGoogle, connectedGithub]}
        availableProviders={[]}
        onConnect={vi.fn()}
      />,
    );

    expect(rowNames()).toEqual(['GitHub', 'Google']);
  });

  it('turns a removed account back into its Connect row while the identifier collapses', async () => {
    const exit = holdExits();
    const { rerender } = render(
      <UserProfileConnectedAccountsSectionView
        accounts={[connectedGoogle, connectedGithub]}
        availableProviders={[]}
        onConnect={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    const row = rowOf('Google');

    rerender(
      <UserProfileConnectedAccountsSectionView
        accounts={[connectedGithub]}
        availableProviders={[google]}
        onConnect={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(rowOf('Google')).toBe(row);
    expect(rowNames()).toEqual(['Google', 'GitHub']);
    expect(screen.getByText('ada@example.com').closest('.cl-section-description')).toHaveAttribute('data-ending-style');
    expect(within(row as HTMLElement).getByRole('button', { name: 'Connect Google' })).toBeInTheDocument();

    await act(async () => {
      exit.resolve();
      await exit.promise;
    });
    expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument();
  });

  it('confirms removal and moves focus to the next connected account', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn(() => Promise.resolve());
    const { rerender } = render(
      <UserProfileConnectedAccountsSectionView
        accounts={[connectedGoogle, connectedGithub]}
        availableProviders={[]}
        onConnect={vi.fn()}
        onRemove={onRemove}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith('idn_google');

    rerender(
      <UserProfileConnectedAccountsSectionView
        accounts={[connectedGithub]}
        availableProviders={[google]}
        onConnect={vi.fn()}
        onRemove={onRemove}
      />,
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage GitHub' })).toHaveFocus());
  });

  it('offers no Connect rows without a connect handler', () => {
    render(
      <UserProfileConnectedAccountsSectionView
        accounts={[connectedGithub]}
        availableProviders={[google]}
      />,
    );

    expect(rowNames()).toEqual(['GitHub']);
  });
});
