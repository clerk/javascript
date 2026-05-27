import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@formkit/auto-animate/react');
vi.unmock('@formkit/auto-animate');

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { clearFetchCache } from '../../hooks';
import { Account } from '../UserProfile/Account';
import { AccountEmails, AccountProfile } from '../UserProfile/sectionWrappers';

const { createFixtures } = bindCreateFixtures('UserProfile');

function findAddAnimationCall(calls: any[]) {
  return calls.find(call => {
    const keyframes = call[0];
    if (!Array.isArray(keyframes)) return false;
    return keyframes.some(
      (kf: any) => kf.opacity === 0 && typeof kf.transform === 'string' && kf.transform.includes('scale'),
    );
  });
}

describe('Action open animation', () => {
  beforeEach(() => {
    clearFetchCache();
    vi.mocked(Element.prototype.animate).mockClear();
  });

  it('calls el.animate with add keyframes when "Update profile" action opens', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withName();
      f.withEmailAddress();
      f.withUser({
        first_name: 'Test',
        last_name: 'User',
        email_addresses: ['test@clerk.com'],
      });
    });

    const { userEvent } = render(<Account />, { wrapper });
    vi.mocked(Element.prototype.animate).mockClear();

    await userEvent.click(screen.getByRole('button', { name: /update profile/i }));
    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeInTheDocument());

    expect(findAddAnimationCall(vi.mocked(Element.prototype.animate).mock.calls)).toBeDefined();
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

    const { userEvent } = render(<Account />, { wrapper });
    vi.mocked(Element.prototype.animate).mockClear();

    await userEvent.click(screen.getByRole('button', { name: /add email address/i }));
    await waitFor(() => expect(screen.getByLabelText(/email address/i)).toBeInTheDocument());

    expect(findAddAnimationCall(vi.mocked(Element.prototype.animate).mock.calls)).toBeDefined();
  });

  it('calls el.animate with add keyframes when "Remove email" action opens via menu', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress();
      f.withUser({
        first_name: 'Test',
        last_name: 'User',
        email_addresses: ['test@clerk.com', 'secondary@clerk.com'],
      });
    });

    const { userEvent } = render(<Account />, { wrapper });

    // Open three-dots menu on the secondary (non-primary) email
    const menuButtons = screen.getAllByRole('button', { name: /open menu/i });
    await userEvent.click(menuButtons[menuButtons.length - 1]);

    // Click "Remove" in the dropdown
    const removeItem = await screen.findByRole('menuitem', { name: /remove/i });
    vi.mocked(Element.prototype.animate).mockClear();
    await userEvent.click(removeItem);

    // The remove confirmation card should appear
    await waitFor(() => expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument());

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
      <Account>
        <AccountProfile />
        <AccountEmails />
      </Account>,
      { wrapper },
    );

    vi.mocked(Element.prototype.animate).mockClear();
    await userEvent.click(screen.getByRole('button', { name: /add email address/i }));
    await waitFor(() => expect(screen.getByLabelText(/email address/i)).toBeInTheDocument());

    expect(findAddAnimationCall(vi.mocked(Element.prototype.animate).mock.calls)).toBeDefined();
  });

  it('composed sections: "Remove email" via menu triggers add animation', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress();
      f.withUser({
        first_name: 'Test',
        last_name: 'User',
        email_addresses: ['test@clerk.com', 'secondary@clerk.com'],
      });
    });

    const { userEvent } = render(
      <Account>
        <AccountProfile />
        <AccountEmails />
      </Account>,
      { wrapper },
    );

    // Verify emails rendered
    screen.getByText('test@clerk.com');
    screen.getByText('secondary@clerk.com');

    // Find and click a menu trigger
    const menuButtons = screen.getAllByRole('button', { name: /open menu/i });
    expect(menuButtons.length).toBeGreaterThan(0);
    await userEvent.click(menuButtons[menuButtons.length - 1]);

    // Wait for menu to appear and click remove
    const removeItem = await screen.findByRole('menuitem', { name: /remove/i });
    vi.mocked(Element.prototype.animate).mockClear();
    await userEvent.click(removeItem);

    // Wait for the remove confirmation form to appear
    await waitFor(
      () => {
        expect(screen.getByText(/will be removed/i)).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    expect(findAddAnimationCall(vi.mocked(Element.prototype.animate).mock.calls)).toBeDefined();
  });
});
