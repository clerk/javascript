import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@formkit/auto-animate/react');
vi.unmock('@formkit/auto-animate');

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { clearFetchCache } from '../../hooks';
import { UserProfileAccountPanel } from '../UserProfile/Account';
import { UserProfileEmailSection } from '../UserProfile/AccountEmails';
import { UserProfileProfileSection } from '../UserProfile/AccountProfile';

const { createFixtures } = bindCreateFixtures('UserProfile');

function findAddAnimationCall(calls: Parameters<Element['animate']>[]) {
  return calls.find(call => {
    const keyframes = call[0];
    if (!Array.isArray(keyframes)) {
      return false;
    }
    return keyframes.some(kf => kf.opacity === 0 && typeof kf.transform === 'string' && kf.transform.includes('scale'));
  });
}

describe('Action open animation', () => {
  beforeEach(() => {
    clearFetchCache();
    vi.mocked(Element.prototype.animate).mockClear();
  });

  it('calls el.animate with add keyframes when "Add email" action opens', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress();
      f.withUser({
        first_name: 'Test',
        last_name: 'User',
        email_addresses: ['test@clerk.com'],
      });
    });

    const { userEvent } = render(<UserProfileAccountPanel />, { wrapper });
    vi.mocked(Element.prototype.animate).mockClear();

    await userEvent.click(screen.getByRole('button', { name: /add email address/i }));
    await waitFor(() => expect(screen.getByLabelText(/email address/i)).toBeInTheDocument());

    expect(findAddAnimationCall(vi.mocked(Element.prototype.animate).mock.calls)).toBeDefined();
  });

  it('composed sections: "Add email" triggers add animation', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress();
      f.withUser({
        first_name: 'Test',
        last_name: 'User',
        email_addresses: ['test@clerk.com'],
      });
    });

    const { userEvent } = render(
      <UserProfileAccountPanel>
        <UserProfileProfileSection />
        <UserProfileEmailSection />
      </UserProfileAccountPanel>,
      { wrapper },
    );

    vi.mocked(Element.prototype.animate).mockClear();
    await userEvent.click(screen.getByRole('button', { name: /add email address/i }));
    await waitFor(() => expect(screen.getByLabelText(/email address/i)).toBeInTheDocument());

    expect(findAddAnimationCall(vi.mocked(Element.prototype.animate).mock.calls)).toBeDefined();
  });
});
