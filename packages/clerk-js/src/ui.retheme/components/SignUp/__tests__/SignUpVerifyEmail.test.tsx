import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { SignUpVerifyEmail } from '../SignUpVerifyEmail';

const { createFixtures } = bindCreateFixtures('SignUp');

describe('SignUpVerifyEmail', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures();
    render(<SignUpVerifyEmail />, { wrapper });
    screen.getByText(/verify/i);
  });

  it('shows the email associated with the sign up', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.startSignUpWithEmailAddress({ emailAddress: 'test@clerk.com' });
    });
    render(<SignUpVerifyEmail />, { wrapper });
    screen.getByText('test@clerk.com');
  });

  it('shows the verify with link message', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true, verifications: ['email_link'] });
      f.startSignUpWithEmailAddress({ emailAddress: 'test@clerk.com' });
    });
    fixtures.signUp.createEmailLinkFlow.mockImplementation(
      () =>
        ({
          startEmailLinkFlow: jest.fn(() => new Promise(() => ({}))),
          cancelEmailLinkFlow: jest.fn(() => new Promise(() => ({}))),
        } as any),
    );

    render(<SignUpVerifyEmail />, { wrapper });
    screen.getAllByText(/Verification Link/i);
  });

  it('shows the verify with code message', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true, verifications: ['email_code'] });
      f.startSignUpWithEmailAddress({ emailAddress: 'test@clerk.com' });
    });
    fixtures.signUp.createEmailLinkFlow.mockImplementation(
      () =>
        ({
          startEmailLinkFlow: jest.fn(() => new Promise(() => ({}))),
          cancelEmailLinkFlow: jest.fn(() => new Promise(() => ({}))),
        } as any),
    );

    render(<SignUpVerifyEmail />, { wrapper });
    screen.getAllByText(/Verification Code/i);
  });

  it('clicking on the edit icon navigates to the previous route', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.startSignUpWithEmailAddress({ emailAddress: 'test@clerk.com' });
    });
    const { userEvent } = render(<SignUpVerifyEmail />, { wrapper });
    await userEvent.click(
      screen.getByRole('button', {
        name: /edit/i,
      }),
    ),
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../');
  });

  it('Resend link button exists', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true, verifications: ['email_link'] });
      f.startSignUpWithEmailAddress({ emailAddress: 'test@clerk.com' });
    });
    fixtures.signUp.createEmailLinkFlow.mockImplementation(
      () =>
        ({
          startEmailLinkFlow: jest.fn(() => new Promise(() => ({}))),
          cancelEmailLinkFlow: jest.fn(() => new Promise(() => ({}))),
        } as any),
    );

    render(<SignUpVerifyEmail />, { wrapper });
    const resendButton = screen.getByText(/Resend/i);
    expect(resendButton.tagName.toUpperCase()).toBe('BUTTON');
  });

  it('Resend code button exists', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true, verifications: ['email_code'] });
      f.startSignUpWithEmailAddress({ emailAddress: 'test@clerk.com' });
    });
    fixtures.signUp.createEmailLinkFlow.mockImplementation(
      () =>
        ({
          startEmailLinkFlow: jest.fn(() => new Promise(() => ({}))),
          cancelEmailLinkFlow: jest.fn(() => new Promise(() => ({}))),
        } as any),
    );

    render(<SignUpVerifyEmail />, { wrapper });
    const resendButton = screen.getByText(/Resend/i);
    expect(resendButton.tagName.toUpperCase()).toBe('BUTTON');
  });

  it.todo('Resend link button is pressable after 60 seconds');
  it.todo('Resend code button is pressable after 30 seconds');
});
