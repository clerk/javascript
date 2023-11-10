import type { SignInResource } from '@clerk/types';
import { OAUTH_PROVIDERS } from '@clerk/types';

import { bindCreateFixtures, fireEvent, render, screen } from '../../../../testUtils';
import { SignInStart } from '../SignInStart';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SignInStart', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress();
      f.withSupportEmail();
    });
    render(<SignInStart />, { wrapper });
    screen.getByText('Sign in');
  });

  describe('Login Methods', () => {
    it('enables login with email address', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
      });

      render(<SignInStart />, { wrapper });
      screen.getByText(/email address/i);
    });

    it('enables login with username', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUsername();
      });

      render(<SignInStart />, { wrapper });
      screen.getByText(/username/i);
    });

    it('enables login with phone number', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
      });
      render(<SignInStart />, { wrapper });
      screen.getByText('Phone number');
    });

    it('enables login with all three (email address, phone number, username)', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.withUsername();
        f.withEmailAddress();
      });
      render(<SignInStart />, { wrapper });
      screen.getByText(/email address or username/i);
    });
  });

  describe('Social OAuth', () => {
    it.each(OAUTH_PROVIDERS)('shows the "Continue with $name" social OAuth button', async ({ provider, name }) => {
      const { wrapper } = await createFixtures(f => {
        f.withSocialProvider({ provider });
      });

      render(<SignInStart />, { wrapper });

      const socialOAuth = screen.getByText(`Continue with ${name}`);
      expect(socialOAuth).toBeDefined();
    });

    it('uses the "cl-socialButtonsIconButton__SOCIALOAUTHNAME" classname when rendering the social button icon only', async () => {
      const { wrapper } = await createFixtures(f => {
        OAUTH_PROVIDERS.forEach(({ provider }) => {
          f.withSocialProvider({ provider });
        });
      });

      const { container } = render(<SignInStart />, { wrapper });

      // target the css classname as this is public API
      OAUTH_PROVIDERS.forEach(providerData => {
        const icon = container.getElementsByClassName(`cl-socialButtonsIconButton__${providerData.provider}`);
        expect(icon.length).toEqual(1);
      });
    });
  });

  describe('navigation', () => {
    it('calls create on clicking Continue button', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
      });
      fixtures.signIn.create.mockReturnValueOnce(Promise.resolve({ status: 'needs_first_factor' } as SignInResource));
      const { userEvent } = render(<SignInStart />, { wrapper });
      await userEvent.type(screen.getByLabelText(/email address/i), 'hello@clerk.com');
      await userEvent.click(screen.getByText('Continue'));
      expect(fixtures.signIn.create).toHaveBeenCalled();
    });

    it('navigates to /factor-one page when user clicks on Continue button and create needs a first factor', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
      });
      fixtures.signIn.create.mockReturnValueOnce(Promise.resolve({ status: 'needs_first_factor' } as SignInResource));
      const { userEvent } = render(<SignInStart />, { wrapper });
      await userEvent.type(screen.getByLabelText(/email address/i), 'hello@clerk.com');
      await userEvent.click(screen.getByText('Continue'));
      expect(fixtures.signIn.create).toHaveBeenCalled();
      expect(fixtures.router.navigate).toHaveBeenCalledWith('factor-one');
    });

    it('navigates to /factor-two page when user clicks on Continue button and create needs a second factor', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
      });
      fixtures.signIn.create.mockReturnValueOnce(Promise.resolve({ status: 'needs_second_factor' } as SignInResource));
      const { userEvent } = render(<SignInStart />, { wrapper });
      expect(screen.getByText('Continue')).toBeInTheDocument();
      await userEvent.type(screen.getByLabelText(/email address/i), 'hello@clerk.com');
      await userEvent.click(screen.getByText('Continue'));
      expect(fixtures.signIn.create).toHaveBeenCalled();
      expect(fixtures.router.navigate).toHaveBeenCalledWith('factor-two');
    });
  });

  describe('SAML', () => {
    it('initiates a SAML flow if saml is listed as a supported first factor', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
      });
      fixtures.signIn.create.mockReturnValueOnce(
        Promise.resolve({
          status: 'needs_identifier',
          supportedFirstFactors: [{ strategy: 'saml' }],
        } as unknown as SignInResource),
      );
      const { userEvent } = render(<SignInStart />, { wrapper });
      await userEvent.type(screen.getByLabelText(/email address/i), 'hello@clerk.com');
      await userEvent.click(screen.getByText('Continue'));
      expect(fixtures.signIn.create).toHaveBeenCalled();
      expect(fixtures.signIn.authenticateWithRedirect).toHaveBeenCalledWith({
        strategy: 'saml',
        redirectUrl: 'http://localhost/#/sso-callback',
        redirectUrlComplete: 'https://dashboard.clerk.com',
      });
    });
  });

  describe('Identifier switching', () => {
    it('shows the email label', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withSupportEmail();
      });
      render(<SignInStart />, { wrapper });
      screen.getByText(/email address/i);
    });

    it('shows the phone label', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.withSupportEmail();
      });
      render(<SignInStart />, { wrapper });
      screen.getByText(/phone number/i);
    });

    it('prioritizes phone over username', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUsername();
        f.withPhoneNumber();
        f.withSupportEmail();
      });
      render(<SignInStart />, { wrapper });
      screen.getByText(/phone number/i);
    });

    it('shows the use phone action', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withUsername();
        f.withPhoneNumber();
        f.withSupportEmail();
      });
      render(<SignInStart />, { wrapper });
      screen.getByText(/use phone/i);
    });

    it('shows the use username action', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUsername();
        f.withPhoneNumber();
        f.withSupportEmail();
      });
      render(<SignInStart />, { wrapper });
      screen.getByText(/use username/i);
    });

    it('shows the username action upon clicking on use phone', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUsername();
        f.withPhoneNumber();
        f.withSupportEmail();
      });
      render(<SignInStart />, { wrapper });
      let button = screen.getByText(/use username/i);
      fireEvent.click(button);

      screen.getByText(/username/i);

      button = screen.getByText(/use phone/i);
      fireEvent.click(button);

      screen.getByText(/use username/i);
    });

    it('shows an input with type="tel" for the phone number', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.withSupportEmail();
      });
      render(<SignInStart />, { wrapper });

      expect(screen.getByRole('textbox', { name: /phone number/i })).toHaveAttribute('type', 'tel');
    });
  });

  describe('initialValues', () => {
    it('prefills the emailAddress field with the correct initial value', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withEmailAddress();
      });
      props.setProps({ initialValues: { emailAddress: 'foo@clerk.com' } });

      render(<SignInStart />, { wrapper });
      screen.getByDisplayValue(/foo@clerk.com/i);
    });

    it('prefills the phoneNumber field with the correct initial value', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withPhoneNumber();
      });
      props.setProps({ initialValues: { phoneNumber: '+306911111111' } });

      render(<SignInStart />, { wrapper });
      screen.getByDisplayValue(/691 1111111/i);
    });

    it('prefills the username field with the correct initial value', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withUsername();
      });

      props.setProps({ initialValues: { username: 'foo' } });
      render(<SignInStart />, { wrapper });
      screen.getByDisplayValue(/foo/i);
    });
  });
});
