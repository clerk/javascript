import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfilePasswordSectionView } from '../user-profile-password-section/user-profile-password-section.view';

describe('UserProfilePasswordSectionView', () => {
  it('hides the entire section when there is no password, manager, or action', () => {
    const { container } = render(
      <MosaicProvider>
        <UserProfilePasswordSectionView />
      </MosaicProvider>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows an existing password without requiring an edit action', () => {
    render(
      <MosaicProvider>
        <UserProfilePasswordSectionView hasPassword />
      </MosaicProvider>,
    );

    expect(screen.getByRole('region', { name: 'Authentication' })).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('offers to set a password when only the action is available', () => {
    render(
      <MosaicProvider>
        <UserProfilePasswordSectionView onSubmitPassword={vi.fn(() => Promise.resolve())} />
      </MosaicProvider>,
    );

    expect(screen.getByText('No password set')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Set password' })).toBeEnabled();
  });

  it('shows the enterprise manager instead of password actions', () => {
    render(
      <MosaicProvider>
        <UserProfilePasswordSectionView
          managedBy={{ name: 'Okta' }}
          onSubmitPassword={vi.fn(() => Promise.resolve())}
        />
      </MosaicProvider>,
    );

    expect(screen.getByText('Managed by Okta')).toBeVisible();
    expect(screen.queryByRole('button', { name: /password/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
