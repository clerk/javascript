import type { ImageResource } from '@clerk/types';
import { describe, it } from '@jest/globals';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { ProfilePage } from '../ProfilePage';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('ProfilePage', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    render(<ProfilePage />, { wrapper });
  });

  it('shows the title', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    render(<ProfilePage />, { wrapper });

    screen.getByRole('heading', { name: /Update Profile/i });
  });

  describe('First and last name', () => {
    it('first and last name inputs exists if name is enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withName();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          first_name: 'F',
          last_name: 'L',
        });
      });
      render(<ProfilePage />, { wrapper });

      const firstNameInput: HTMLInputElement = screen.getByLabelText(/first name/i);
      const lastNameInput: HTMLInputElement = screen.getByLabelText(/last name/i);
      expect(firstNameInput.value).toBe('F');
      expect(lastNameInput.value).toBe('L');
    });
  });

  describe('with SAML', () => {
    it('disables the first & last name inputs if user has active enterprise connections', async () => {
      const emailAddress = 'george@jungle.com';
      const firstName = 'George';
      const lastName = 'Clerk';

      const config = createFixtures.config(f => {
        f.withEmailAddress();
        f.withSaml();
        f.withName();
        f.withUser({
          first_name: firstName,
          last_name: lastName,
          email_addresses: [emailAddress],
          saml_accounts: [
            {
              id: 'samlacc_foo',
              provider: 'saml_okta',
              active: true,
              email_address: emailAddress,
            },
          ],
        });
      });

      const { wrapper } = await createFixtures(config);

      render(<ProfilePage />, { wrapper });

      expect(screen.getByRole('textbox', { name: 'First name' })).toBeDisabled();
      expect(screen.getByRole('textbox', { name: 'Last name' })).toBeDisabled();

      screen.getByText('Your profile information has been provided by the enterprise connection and cannot be edited.');
    });

    it('does not disable the first & last name inputs if user has no active enterprise connections', async () => {
      const emailAddress = 'george@jungle.com';
      const firstName = 'George';
      const lastName = 'Clerk';

      const config = createFixtures.config(f => {
        f.withEmailAddress();
        f.withSaml();
        f.withName();
        f.withUser({
          first_name: firstName,
          last_name: lastName,
          email_addresses: [emailAddress],
          saml_accounts: [
            {
              id: 'samlacc_foo',
              provider: 'saml_okta',
              active: false,
              email_address: emailAddress,
            },
          ],
        });
      });

      const { wrapper } = await createFixtures(config);

      render(<ProfilePage />, { wrapper });

      expect(screen.getByRole('textbox', { name: 'First name' })).not.toBeDisabled();
      expect(screen.getByRole('textbox', { name: 'Last name' })).not.toBeDisabled();

      expect(
        screen.queryByText(
          'Your profile information has been provided by the enterprise connection and cannot be edited.',
        ),
      ).not.toBeInTheDocument();
    });
  });

  describe('Profile image', () => {
    it('shows the image', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          profile_image_url: 'https://clerk.com',
          image_url: 'https://clerk.com',
          first_name: 'F',
          last_name: 'L',
        });
      });
      render(<ProfilePage />, { wrapper });

      screen.getByRole('img', { name: 'F L' });
    });

    it('clicking "Upload image" opens the "Upload" section', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
        });
      });
      const { userEvent } = render(<ProfilePage />, { wrapper });

      expect(screen.queryByText(/select file/i)).toBeNull();
      await userEvent.click(screen.getByText(/upload image/i));
      screen.getByText(/select file/i);
    });

    it('clicking "Remove image" calls the appropriate function', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          profile_image_url: 'https://clerk.com',
          image_url:
            'https://img.clerkstage.dev/70726f78792f68747470733a2f2f696d616765732e6c636c636c65726b2e636f6d2f75706c6f616465642f696d675f324f4559646f346e575263766579536c6a366b7775757a336e79472e6a706567',
        });
      });
      fixtures.clerk.user?.setProfileImage.mockReturnValueOnce(Promise.resolve({} as ImageResource));
      const { userEvent } = render(<ProfilePage />, { wrapper });

      await userEvent.click(screen.getByText(/remove image/i));
      expect(fixtures.clerk.user?.setProfileImage).toHaveBeenCalledWith({ file: null });
    });

    xit('"Remove image" is not shown when a default image exists', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          image_url:
            'https://img.clerkstage.dev/64656661756c742f696e735f3248326461375851494c494b727555654e464967456b73396878362f757365725f3249454d6b59705573514465427162327564677843717565345757?initials=GD',
        });
      });
      fixtures.clerk.user?.setProfileImage.mockReturnValueOnce(Promise.resolve({} as ImageResource));
      render(<ProfilePage />, { wrapper });

      expect(screen.queryByText(/remove image/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Buttons', () => {
    it('form buttons appear as expected', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withName();
        f.withUser({
          email_addresses: ['test@clerk.com'],
        });
      });
      render(<ProfilePage />, { wrapper });

      screen.getByRole('button', { name: /cancel/i });
      screen.getByRole('button', { name: /continue/i });
    });

    it('pressing cancel navigates to the root page', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withName();
        f.withUser({
          email_addresses: ['test@clerk.com'],
        });
      });
      const { userEvent } = render(<ProfilePage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });

    it('pressing cancel navigates to the root page', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withName();
        f.withUser({
          email_addresses: ['test@clerk.com'],
        });
      });
      const { userEvent } = render(<ProfilePage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('/');
    });

    it('continue button is disabled by default', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withName();
        f.withUser({
          email_addresses: ['test@clerk.com'],
        });
      });
      render(<ProfilePage />, { wrapper });

      expect(screen.getByText(/continue/i, { exact: false }).closest('button')).toHaveAttribute('disabled');
    });

    it("continue button is enabled after changing an input field's value", async () => {
      const { wrapper } = await createFixtures(f => {
        f.withName();
        f.withUser({
          email_addresses: ['test@clerk.com'],
        });
      });
      const { userEvent } = render(<ProfilePage />, { wrapper });

      expect(screen.getByText(/continue/i, { exact: false }).closest('button')).toHaveAttribute('disabled');
      await userEvent.type(screen.getByText(/First name/i), 'George');
      expect(screen.getByText(/continue/i, { exact: false }).closest('button')).not.toHaveAttribute('disabled');
    });

    it('calls the appropriate function if continue is pressed', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withName();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          first_name: 'F',
          last_name: 'L',
        });
      });
      fixtures.clerk.user?.update.mockReturnValueOnce(Promise.resolve({} as any));
      const { userEvent } = render(<ProfilePage />, { wrapper });

      await userEvent.type(screen.getByLabelText(/first name/i), 'George');
      await userEvent.type(screen.getByLabelText(/last name/i), 'Clerk');
      await userEvent.click(screen.getByText(/continue/i));
      expect(fixtures.clerk.user?.update).toHaveBeenCalledWith({ firstName: 'FGeorge', lastName: 'LClerk' });
    });
  });
});
