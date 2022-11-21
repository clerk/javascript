import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { SignUpStart } from '../SignUpStart';

const { createFixtures } = bindCreateFixtures('SignUp');

describe('SignUpStart', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures();
    render(<SignUpStart />, { wrapper });
    screen.getByText(/create/i);
  });

  describe('Sign up options', () => {
    it('enables sign up with email address', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
      });
      render(<SignUpStart />, { wrapper });
      screen.getByText('Email address');
    });

    it('enables sign up with phone number', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber({ required: true });
      });
      render(<SignUpStart />, { wrapper });
      screen.getByText('Phone number');
    });

    it('enables sign up with email address and password', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
        f.withPassword({ required: true });
      });
      render(<SignUpStart />, { wrapper });
      screen.getByText('Email address');
      screen.getByText('Password');
    });

    it('enables sign up with phone number and password', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber({ required: true });
        f.withPassword({ required: true });
      });
      render(<SignUpStart />, { wrapper });
      screen.getByText('Phone number');
      screen.getByText('Password');
    });

    it('enables sign up with email address or phone number', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress({ required: false });
        f.withPhoneNumber({ required: false });
      });
      render(<SignUpStart />, { wrapper });
      screen.getByText('Email address');
      screen.getByText('Use phone instead');
    });

    it('enables sign up with email address and phone number', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
        f.withPhoneNumber({ required: true });
      });
      render(<SignUpStart />, { wrapper });
      screen.getByText('Email address');
      screen.getByText('Phone number');
    });

    it('enables sign up with email address, phone number and password', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
        f.withPhoneNumber({ required: true });
        f.withPassword({ required: true });
      });
      render(<SignUpStart />, { wrapper });
      screen.getByText('Email address');
      screen.getByText('Phone number');
      screen.getByText('Password');
    });

    it('enables optional email', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress({ required: false });
        f.withPhoneNumber({ required: true });
        f.withPassword({ required: true });
      });
      render(<SignUpStart />, { wrapper });
      expect(screen.getByText('Email address').nextElementSibling?.textContent).toBe('Optional');
    });

    it('enables optional phone number', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
        f.withPhoneNumber({ required: false });
        f.withPassword({ required: true });
      });
      render(<SignUpStart />, { wrapper });
      expect(screen.getByText('Phone number').nextElementSibling?.textContent).toBe('Optional');
    });

    it('shows the "Continue" button', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
        f.withPassword({ required: true });
      });
      render(<SignUpStart />, { wrapper });
      expect(screen.getByText('Continue').tagName.toUpperCase()).toBe('BUTTON');
    });
  });
});
