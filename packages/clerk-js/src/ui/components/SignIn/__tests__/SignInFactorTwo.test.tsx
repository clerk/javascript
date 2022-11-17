import { describe, it } from '@jest/globals';
import React from 'react';
import { createFixture as _createFixture, render } from 'testUtils';

import { SignInFactorTwo } from '../SignInFactorTwo';

const createFixture = _createFixture('SignIn');

describe('SignInFactorTwo', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixture(f => {
      f.withEmailAddress();
    });
    render(<SignInFactorTwo />, { wrapper });
  });

  describe('Navigation', () => {
    it.todo('navigates to SignInStart component if user lands on SignInFactorTwo page but they should not');
  });

  describe('Submitting', () => {
    it.todo('sets an active session when user submits second factor successfully');
  });

  describe('Selected Second Factor Method', () => {
    describe('Phone Code', () => {
      it.todo('renders the correct screen with the text "Check your phone"');
      it.todo('hides with * the phone number digits except the last 2');
      it.todo('enables the "Resend code" button after 30 seconds');
      it.todo('resets the 30 seconds timer when clicking the "Resend code" button');
      it.todo('auto submits when typing all the 6 digits of the code');
      it.todo('shows a UI error when submission fails');
    });

    describe('Authenticator app', () => {
      it.todo('renders the correct screen with the text "Authenticator app"');
      it.todo('auto submits when typing all the 6 digits of the code');
      it.todo('shows a UI error when submission fails');
    });

    describe('Backup code', () => {
      it.todo('renders the correct screen with the text "Enter a backup code"');
      it.todo('submits the value when user clicks the continue button');
      it.todo('shows a UI error when user clicks the continue button with password field empty');
      it.todo('shows a UI error when submission fails');
    });
  });

  describe('Use another method', () => {
    it.todo('renders the other authentication methods list component when clicking on "Use another method"');
    it.todo('goes back to the main screen when clicking the "<- Back" button');
    it.todo('lists all the enabled second factor methods');
    it.todo('shows the SMS code input when clicking the Phone code method');
    it.todo('shows the Authenticator app screen when clicking the Authenticator app method');
    it.todo('shows the Backup code screen when clicking the Backup code method');

    describe('Get Help', () => {
      it.todo('renders the get help component when clicking the "Get Help" button');
      it.todo('goes back to "Use another method" screen when clicking the "<- Back" button');
      it.todo('opens a "mailto:" link when clicking the email support button');
    });
  });
});
