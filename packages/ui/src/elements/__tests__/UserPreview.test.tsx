import type { ExternalAccountResource, UserResource } from '@clerk/shared/types';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';

import { UserPreviewView } from '../user-preview.view';
import { UserPreview } from '../UserPreview';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('UserPreview', () => {
  it('shows user labels, the image override, and initials after an image error', async () => {
    const { wrapper } = await createFixtures();
    const user = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      username: 'ada',
      imageUrl: 'https://example.com/original.png',
    };
    const { getByText, getByRole } = render(
      <UserPreview
        user={user}
        imageUrl='https://example.com/override.png'
      />,
      { wrapper },
    );

    expect(getByText('Ada Lovelace')).toBeVisible();
    expect(getByText('ada')).toBeVisible();
    const image = getByRole('img');
    expect(image.getAttribute('src')).toContain('override.png');
    fireEvent.error(image);
    expect(getByText('AL')).toBeVisible();
  });

  it('reads the primary email from a resource getter without copying unused fields', async () => {
    const { wrapper } = await createFixtures();
    const user: Partial<UserResource> = { firstName: 'Ada', lastName: 'Lovelace' };
    Object.setPrototypeOf(user, {
      get primaryEmailAddress() {
        return { emailAddress: 'ada@example.com' };
      },
    });
    Object.defineProperty(user, 'unusedResourceField', {
      enumerable: true,
      get() {
        throw new Error('An unused resource field was read');
      },
    });
    const { getByText } = render(<UserPreview user={user} />, { wrapper });

    expect(getByText('Ada Lovelace')).toBeVisible();
    expect(getByText('ada@example.com')).toBeVisible();
  });

  it('keeps the external account as the receiver of its identifier method', async () => {
    const { wrapper } = await createFixtures();
    const externalAccount: Partial<ExternalAccountResource> = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      emailAddress: 'external@example.com',
      accountIdentifier() {
        return this.emailAddress;
      },
    };
    const { getByText } = render(<UserPreview externalAccount={externalAccount} />, { wrapper });

    expect(getByText('Ada Lovelace')).toBeVisible();
    expect(getByText('external@example.com')).toBeVisible();
  });

  it('shows enterprise labels and explicit title and subtitle overrides', async () => {
    const { wrapper } = await createFixtures();
    const enterpriseAccount = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      emailAddress: 'enterprise@example.com',
    };
    const { getByText, queryByText, rerender } = render(<UserPreview enterpriseAccount={enterpriseAccount} />, {
      wrapper,
    });

    expect(getByText('Ada Lovelace')).toBeVisible();
    expect(getByText('enterprise@example.com')).toBeVisible();
    rerender(
      <UserPreview
        enterpriseAccount={enterpriseAccount}
        title='Account'
        subtitle='Selected account'
      />,
    );
    expect(getByText('Account')).toBeVisible();
    expect(getByText('Selected account')).toBeVisible();
    expect(queryByText('enterprise@example.com')).toBeNull();
  });

  it('renders plain preview data and preserves initials when the image fails', async () => {
    const { wrapper } = await createFixtures();
    const { getByText, getByRole } = render(
      <UserPreviewView
        name='Ada Lovelace'
        identifier='ada@example.com'
        imageUrl='https://example.com/avatar.png'
        avatar={{ firstName: 'Ada', lastName: 'Lovelace' }}
      />,
      { wrapper },
    );

    expect(getByText('Ada Lovelace')).toBeVisible();
    expect(getByText('ada@example.com')).toBeVisible();
    fireEvent.error(getByRole('img'));
    expect(getByText('AL')).toBeVisible();
  });
});
