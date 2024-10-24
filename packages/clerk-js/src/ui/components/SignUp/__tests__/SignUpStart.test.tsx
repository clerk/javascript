import type { SignUpResource } from '@clerk/types';
import { OAUTH_PROVIDERS } from '@clerk/types';

import { render, screen, waitFor } from '../../../../testUtils';
import { OptionsProvider } from '../../../contexts';
import { AppearanceProvider } from '../../../customizables';
import { CardStateProvider } from '../../../elements';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
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
      const button = screen.getByText('Continue');
      expect(button.tagName.toUpperCase()).toBe('SPAN');
      expect(button.parentElement?.tagName.toUpperCase()).toBe('BUTTON');
    });

    it.each(OAUTH_PROVIDERS)('shows the "Continue with $name" social OAuth button', async ({ provider, name }) => {
      const { wrapper } = await createFixtures(f => {
        f.withSocialProvider({ provider });
      });

      render(<SignUpStart />, { wrapper });
      screen.getByText(`Continue with ${name}`);
    });

    it('shows the "Join with $name" social OAuth button', async () => {
      const providers = OAUTH_PROVIDERS.filter(({ provider }) => provider !== 'linkedin_oidc');
      const { wrapper: Wrapper } = await createFixtures(f => {
        providers.forEach(({ provider }) => {
          f.withSocialProvider({ provider });
        });
      });

      const wrapperBefore = ({ children }) => (
        <Wrapper>
          <AppearanceProvider
            appearanceKey={'signUp'}
            appearance={{
              layout: {
                socialButtonsVariant: 'blockButton',
              },
            }}
          >
            <OptionsProvider
              value={{
                localization: {
                  socialButtonsBlockButtonManyInView: 'Join with {{provider}}',
                },
              }}
            >
              {children}
            </OptionsProvider>
          </AppearanceProvider>
        </Wrapper>
      );

      render(<SignUpStart />, { wrapper: wrapperBefore });

      providers.forEach(providerData => {
        screen.getByText(`Join with ${providerData.name}`);
      });
    });

    it('displays the "or" divider when using oauth and email options', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
        f.withSocialProvider({ provider: 'google' });
      });

      const { container } = render(<SignUpStart />, { wrapper });
      screen.getByText(/Continue with/i);
      expect(container.querySelector('.cl-dividerText')?.textContent?.includes('or')).toBeTruthy();
    });
  });

  describe('Sign in Link', () => {
    it('Shows the Sign In message with the appropriate link', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
        f.withPassword({ required: true });
      });
      render(<SignUpStart />, { wrapper });

      const signInLink = screen.getByText('Already have an account?').nextElementSibling;
      expect(signInLink?.textContent).toBe('Sign in');
      expect(signInLink?.tagName.toUpperCase()).toBe('A');
      expect(signInLink?.getAttribute('href')).toMatch(fixtures.environment.displayConfig.signInUrl);
    });
  });

  describe('Preserved values from FAPI', () => {
    it('Shows the values from the sign up object as default prepopulated values', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
        f.withPhoneNumber({ required: true });
        f.withName({ required: true });
      });

      fixtures.clerk.client.signUp.emailAddress = 'george@clerk.com';
      fixtures.clerk.client.signUp.firstName = 'George';
      fixtures.clerk.client.signUp.lastName = 'Clerk';
      fixtures.clerk.client.signUp.phoneNumber = '+1123456789';

      const screen = render(<SignUpStart />, { wrapper });

      expect(screen.getByRole('textbox', { name: 'Email address' })).toHaveValue('george@clerk.com');
      expect(screen.getByRole('textbox', { name: 'First name' })).toHaveValue('George');
      expect(screen.getByRole('textbox', { name: 'Last name' })).toHaveValue('Clerk');
      expect(screen.getByRole('textbox', { name: 'Phone number' })).toHaveValue('(123) 456-789');
    });
  });

  describe('initialValues', () => {
    it('prefills the emailAddress field with the correct initial value', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withEmailAddress();
      });
      props.setProps({ initialValues: { emailAddress: 'foo@clerk.com' } });

      render(<SignUpStart />, { wrapper });
      screen.getByDisplayValue(/foo@clerk.com/i);
    });

    it('prefills the phoneNumber field with the correct initial value', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withPhoneNumber();
      });
      props.setProps({ initialValues: { phoneNumber: '+306911111111' } });

      render(<SignUpStart />, { wrapper });
      screen.getByDisplayValue(/691 1111111/i);
    });

    it('prefills the username field with the correct initial value', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withUsername();
      });

      props.setProps({ initialValues: { username: 'foo' } });
      render(<SignUpStart />, { wrapper });
      screen.getByDisplayValue(/foo/i);
    });
  });

  describe('Restricted signup', () => {
    it('shows the restricted component', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withRestrictedMode();
      });
      render(<SignUpStart />, { wrapper });
      screen.getByText('Access restricted');
    });
  });

  describe('Waitlist signup', () => {
    it('shows the restricted component with waitlist mode', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withWaitlistMode();
      });

      render(<SignUpStart />, { wrapper });
      screen.getByText('Access restricted');
      screen.getByText('Join waitlist');
    });
  });

  describe('Legal consent', () => {
    it('shows sign up component with legal consent checkbox', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withLegalConsent();
        f.withTermsPrivacyPolicyUrls({
          privacyPolicy: 'https://clerk.dev/privacy',
          termsOfService: 'https://clerk.dev/tos',
        });
      });

      render(<SignUpStart />, { wrapper });
      screen.getByText('Terms of Service');
      screen.getByText('Privacy Policy');
    });
  });

  describe('ticket flow', () => {
    it('calls the appropriate resource function upon detecting the ticket', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
      });
      fixtures.signUp.create.mockResolvedValueOnce({} as SignUpResource);

      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: 'http://localhost/sign-up?__clerk_ticket=test_ticket' },
      });
      Object.defineProperty(window, 'history', {
        writable: true,
        value: { replaceState: jest.fn() },
      });

      render(
        <CardStateProvider>
          <SignUpStart />
        </CardStateProvider>,
        { wrapper },
      );

      await waitFor(() =>
        expect(fixtures.signUp.create).toHaveBeenCalledWith({ strategy: 'ticket', ticket: 'test_ticket' }),
      );

      //don't remove the query param quite yet
      expect(window.history.replaceState).not.toHaveBeenCalledWith(
        undefined,
        '',
        expect.not.stringContaining('__clerk_ticket'),
      );
    });

    it('removes the ticket from the url when completing the sign up', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
      });
      fixtures.signUp.status = 'complete';
      fixtures.signUp.create.mockResolvedValueOnce(fixtures.signUp as SignUpResource);

      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: 'http://localhost/sign-up?__clerk_ticket=test_ticket' },
      });
      Object.defineProperty(window, 'history', {
        writable: true,
        value: { replaceState: jest.fn() },
      });

      render(
        <CardStateProvider>
          <SignUpStart />
        </CardStateProvider>,
        { wrapper },
      );

      await waitFor(() =>
        expect(fixtures.signUp.create).toHaveBeenCalledWith({ strategy: 'ticket', ticket: 'test_ticket' }),
      );

      expect(window.history.replaceState).toHaveBeenCalledWith(
        undefined,
        '',
        expect.not.stringContaining('__clerk_ticket'),
      );
      expect(window.history.replaceState).toHaveBeenCalledWith(
        undefined,
        '',
        expect.not.stringContaining('__clerk_invitation_token'),
      );
    });

    it('should show the sign up form when ticket detected and mode is restricted', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.withRestrictedMode();
      });
      fixtures.signUp.create.mockResolvedValueOnce({} as SignUpResource);

      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: 'http://localhost/sign-up?__clerk_ticket=test_ticket' },
      });
      Object.defineProperty(window, 'history', {
        writable: true,
        value: { replaceState: jest.fn() },
      });

      render(
        <CardStateProvider>
          <SignUpStart />
        </CardStateProvider>,
        { wrapper },
      );

      await waitFor(() => screen.getByText(/create your account/i));
    });
  });
});
