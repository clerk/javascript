import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileNameRowView } from '../user-profile-account-section/user-profile-name-row.view';

describe('UserProfileNameRowView', () => {
  it('leaves the description out when the user has no name', () => {
    render(
      <MosaicProvider>
        <UserProfileNameRowView
          name=''
          onSubmit={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(document.querySelector('.cl-section-description')).toBeNull();
  });
});
