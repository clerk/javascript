import { ImageResource } from '@clerk/types';
import { describe, it } from '@jest/globals';
import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { ProfilePage } from '../ProfilePage';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('ProfilePage', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.dev'] });
    });
    render(<ProfilePage />, { wrapper });
  });

  it('shows the title', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.dev'] });
    });
    render(<ProfilePage />, { wrapper });

    screen.getByRole('heading', { name: /Update Profile/i });
  });

  describe('First and last name', () => {
    it('first and last name inputs exists if name is enabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withName();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
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

  describe('Profile image', () => {
    it('shows the image', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          profile_image_url: 'testurl',
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
          email_addresses: ['test@clerk.dev'],
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
          email_addresses: ['test@clerk.dev'],
          profile_image_url: 'testurl',
        });
      });
      fixtures.clerk.user?.setProfileImage.mockReturnValueOnce(Promise.resolve({} as ImageResource));
      const { userEvent } = render(<ProfilePage />, { wrapper });

      await userEvent.click(screen.getByText(/remove image/i));
      expect(fixtures.clerk.user?.setProfileImage).toHaveBeenCalledWith({ file: null });
    });
  });

  describe('Form Buttons', () => {
    it('form buttons appear as expected', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withName();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
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
          email_addresses: ['test@clerk.dev'],
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
          email_addresses: ['test@clerk.dev'],
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
          email_addresses: ['test@clerk.dev'],
        });
      });
      render(<ProfilePage />, { wrapper });

      expect(screen.getByText(/continue/i, { exact: false }).closest('button')).toHaveAttribute('disabled');
    });

    it("continue button is enabled after changing an input field's value", async () => {
      const { wrapper } = await createFixtures(f => {
        f.withName();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
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
          email_addresses: ['test@clerk.dev'],
          first_name: 'F',
          last_name: 'L',
        });
      });
      fixtures.clerk.user!.update.mockReturnValueOnce(Promise.resolve({} as any));
      const { userEvent } = render(<ProfilePage />, { wrapper });

      await userEvent.type(screen.getByLabelText(/first name/i), 'George');
      await userEvent.type(screen.getByLabelText(/last name/i), 'Clerk');
      await userEvent.click(screen.getByText(/continue/i));
      expect(fixtures.clerk.user?.update).toHaveBeenCalledWith({ firstName: 'FGeorge', lastName: 'LClerk' });
    });
  });
});
