import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, onTestFinished, vi } from 'vitest';

import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiEnvironment } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import type { WaitlistProps } from '../waitlist';
import { Waitlist } from '../waitlist';

function renderWaitlist(props: WaitlistProps = {}) {
  return renderWithClerk(<Waitlist {...props} />);
}

const emailField = () => screen.getByRole('textbox', { name: 'Email address' });
const joinButton = () => screen.getByRole('button', { name: 'Join the waitlist' });

async function join(emailAddress: string) {
  const user = userEvent.setup();
  await user.type(await screen.findByRole('textbox', { name: 'Email address' }), emailAddress);
  await user.click(joinButton());
  return user;
}

describe('Waitlist', () => {
  describe('joining', () => {
    it('adds the email address to the waitlist and thanks the user', async () => {
      const fapi = serveFapi();
      await renderWaitlist();

      await join('alice@example.com');

      expect(await screen.findByRole('heading', { name: 'Thanks for joining the waitlist!' })).toHaveFocus();
      expect(screen.getByText('We’ll be in touch when your spot is ready')).toBeInTheDocument();
      expect(fapi.waitlistEntries).toEqual(['alice@example.com']);
      expect(screen.queryByRole('status')).toBeNull();
    });

    it('holds the form while the request is in flight', async () => {
      serveFapi();
      await renderWaitlist();
      const request = holdRequests('post', '/v1/waitlist');

      await join('alice@example.com');

      await waitFor(() => expect(request.requests).toHaveLength(1));
      expect(emailField()).toHaveAttribute('aria-disabled', 'true');
      await userEvent.setup().click(screen.getByRole('button', { name: /Join the waitlist/ }));
      expect(request.requests).toHaveLength(1);

      request.release();
      expect(await screen.findByRole('heading', { name: 'Thanks for joining the waitlist!' })).toBeInTheDocument();
    });

    it('cannot be submitted without an email address', async () => {
      serveFapi();
      await renderWaitlist();

      await screen.findByRole('textbox', { name: 'Email address' });
      expect(joinButton()).toHaveAttribute('aria-disabled', 'true');
    });

    it('fills in the email address from the query string', async () => {
      const originalUrl = window.location.href;
      window.history.replaceState(null, '', '?email_address=bob%40example.com');
      onTestFinished(() => window.history.replaceState(null, '', originalUrl));
      const fapi = serveFapi();
      await renderWaitlist();

      expect(await screen.findByRole('textbox', { name: 'Email address' })).toHaveValue('bob@example.com');
      await userEvent.setup().click(joinButton());

      await screen.findByRole('heading', { name: 'Thanks for joining the waitlist!' });
      expect(fapi.waitlistEntries).toEqual(['bob@example.com']);
    });
  });

  describe('errors', () => {
    it('shows an invalid email address on the field', async () => {
      const fapi = serveFapi();
      await renderWaitlist();

      await join('not-an-email');

      await waitFor(() =>
        expect(emailField()).toHaveAccessibleDescription('Email address must be a valid email address.'),
      );
      expect(emailField()).toHaveAttribute('aria-invalid', 'true');
      expect(fapi.waitlistEntries).toEqual([]);
      expect(screen.queryByRole('heading', { name: 'Thanks for joining the waitlist!' })).toBeNull();
    });

    it('shows a failure that names no field above the form, and lets the user try again', async () => {
      serveFapi();
      await renderWaitlist();
      const request = holdRequests('post', '/v1/waitlist');

      await join('alice@example.com');
      await waitFor(() => expect(request.requests).toHaveLength(1));
      request.fail('waitlist_unavailable', 'The waitlist is not accepting new entries.');

      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('The waitlist is not accepting new entries.'),
      );
      expect(emailField()).toHaveValue('alice@example.com');
      expect(emailField()).not.toHaveAttribute('aria-disabled');
      expect(joinButton()).not.toHaveAttribute('aria-disabled');
    });
  });

  describe('after joining', () => {
    it('sends the user to afterJoinWaitlistUrl once the thank-you has shown', async () => {
      serveFapi();
      const { navigate } = await renderWaitlist({ afterJoinWaitlistUrl: '/thanks' });
      vi.useFakeTimers({ shouldAdvanceTime: true });
      onTestFinished(() => {
        vi.useRealTimers();
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      await user.type(await screen.findByRole('textbox', { name: 'Email address' }), 'alice@example.com');
      await user.click(joinButton());

      expect(await screen.findByRole('status')).toHaveTextContent('You will be redirected soon…');
      expect(navigate).not.toHaveBeenCalled();

      await act(() => vi.advanceTimersByTimeAsync(2000));
      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/thanks'));
    });
  });

  describe('signing in', () => {
    it('goes to the application sign-in URL', async () => {
      serveFapi({ environment: fapiEnvironment({ display_config: { sign_in_url: '/login' } }) });
      const { navigate } = await renderWaitlist();

      await userEvent.setup().click(await screen.findByRole('button', { name: 'Sign in' }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/login'));
    });

    it('goes to signInUrl when one is passed', async () => {
      serveFapi();
      const { navigate } = await renderWaitlist({ signInUrl: '/custom-sign-in' });

      await userEvent.setup().click(await screen.findByRole('button', { name: 'Sign in' }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/custom-sign-in'));
    });
  });

  describe('branding', () => {
    it('signs the card when the instance is branded', async () => {
      serveFapi({ environment: fapiEnvironment({ display_config: { branded: true } }) });
      await renderWaitlist();

      await screen.findByRole('textbox', { name: 'Email address' });
      expect(screen.getByText(/Secured by/)).toBeInTheDocument();
    });

    it('carries no signature when the branding is paid off', async () => {
      serveFapi();
      await renderWaitlist();

      await screen.findByRole('textbox', { name: 'Email address' });
      expect(screen.queryByText(/Secured by/)).toBeNull();
    });
  });
});
