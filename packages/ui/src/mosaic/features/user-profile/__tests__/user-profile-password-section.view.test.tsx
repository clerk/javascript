import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfilePasswordSectionView } from '../user-profile-password-section/user-profile-password-section.view';

describe('UserProfilePasswordSectionView', () => {
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
