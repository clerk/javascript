import { beforeEach, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { clearFetchCache } from '../../../hooks';
import { ProfileCard } from '../index';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('ProfilePagePanel', () => {
  beforeEach(() => {
    clearFetchCache();
  });

  it('renders title heading', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    render(
      <ProfileCard.PagePanel
        pageId='account'
        titleKey='userProfile.start.headerTitle__account'
      >
        <div>section content</div>
      </ProfileCard.PagePanel>,
      { wrapper },
    );

    expect(screen.getByRole('heading')).toBeInTheDocument();
    screen.getByText('section content');
  });

  it('renders alert content when provided', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    render(
      <ProfileCard.PagePanel
        pageId='account'
        titleKey='userProfile.start.headerTitle__account'
        alertContent='Something went wrong'
      >
        <div>content</div>
      </ProfileCard.PagePanel>,
      { wrapper },
    );

    screen.getByText('Something went wrong');
  });

  it('does not render Card.Alert when alertContent is undefined', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const { container } = render(
      <ProfileCard.PagePanel
        pageId='security'
        titleKey='userProfile.start.headerTitle__security'
      >
        <div>content</div>
      </ProfileCard.PagePanel>,
      { wrapper },
    );

    const alert = container.querySelector('[class*="alert"]');
    expect(alert).not.toBeInTheDocument();
  });

  it('renders children', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    render(
      <ProfileCard.PagePanel
        pageId='account'
        titleKey='userProfile.start.headerTitle__account'
      >
        <div data-testid='child-1'>First</div>
        <div data-testid='child-2'>Second</div>
      </ProfileCard.PagePanel>,
      { wrapper },
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });
});
