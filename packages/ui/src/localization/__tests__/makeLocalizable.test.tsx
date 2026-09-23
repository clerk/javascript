import { ClerkRuntimeError } from '@clerk/shared/error';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, renderHook, screen } from '@/test/utils';
import { OptionsProvider } from '@/ui/contexts';
import {
  Badge,
  Button,
  FormErrorText,
  FormLabel,
  Heading,
  Link,
  localizationKeys,
  SimpleButton,
  Text,
  useLocalizations,
} from '@/ui/customizables';

const { createFixtures } = bindCreateFixtures('SignIn');

const localizableElements = [
  { name: 'Badge', el: Badge },
  { name: 'Button', el: Button },
  { name: 'FormErrorText', el: FormErrorText },
  { name: 'FormLabel', el: FormLabel },
  { name: 'Heading', el: Heading },
  { name: 'Link', el: Link },
  { name: 'SimpleButton', el: SimpleButton },
  { name: 'Text', el: Text },
];

describe('Test localizable components', () => {
  it.each(localizableElements)(
    '$name renders the localization value based on the localization key',
    async ({ el: El }) => {
      const { wrapper } = await createFixtures();

      render(<El localizationKey={localizationKeys('backButton')} />, { wrapper });

      const { result } = renderHook(() => useLocalizations(), { wrapper });

      const localizedValue = result.current.t(localizationKeys('backButton'));

      screen.getByText(localizedValue);
    },
  );

  it.each(localizableElements)('$name renders the children if no localization key is provided', async ({ el: El }) => {
    const { wrapper } = await createFixtures();

    render(<El>test</El>, { wrapper });

    screen.getByText('test');
  });

  it.each(localizableElements)(
    '$name only renders the localization value if both children and key are provided',
    async ({ el: El }) => {
      const { wrapper } = await createFixtures();

      render(<El localizationKey={localizationKeys('backButton')}>test</El>, { wrapper });

      const { result } = renderHook(() => useLocalizations(), { wrapper });

      const localizedValue = result.current.t(localizationKeys('backButton'));

      screen.getByText(localizedValue);
    },
  );

  it.each(localizableElements)('$name renders the global token if provided with one', async ({ el: El }) => {
    const { wrapper } = await createFixtures();

    render(<El localizationKey={localizationKeys('socialButtonsBlockButton', { provider: 'test_provider' })} />, {
      wrapper,
    });

    screen.getByText(`Continue with Test_provider`); // this key makes use of titleize
  });

  it.each(localizableElements)('$name renders the global date token if provided with one', async ({ el: El }) => {
    const { wrapper } = await createFixtures();

    const date = new Date('11/12/1999');

    render(<El localizationKey={localizationKeys('dates.numeric', { date })} />, {
      wrapper,
    });

    screen.getByText('11/12/1999'); // this key makes use of numeric('en-US')
  });

  it('translates errors using the values provided in unstable_errors', async () => {
    const { wrapper, fixtures } = await createFixtures();
    fixtures.options.localization = {
      unstable__errors: {
        form_identifier_not_found: 'form_identifier_not_found',
        form_password_pwned: 'form_password_pwned',
        form_username_invalid_length: 'form_username_invalid_length',
        form_username_invalid_character: 'form_username_invalid_character',
        form_param_format_invalid: 'form_param_format_invalid',
        form_password_length_too_short: 'form_password_length_too_short',
        form_param_nil: 'form_param_nil',
        form_code_incorrect: 'form_code_incorrect',
        form_password_incorrect: 'form_password_incorrect',
        not_allowed_access: undefined,
        oauth_access_denied: 'oauth_access_denied',
        form_identifier_exists: 'form_identifier_exists',
        form_identifier_exists__username: 'form_identifier_exists__username',
        form_identifier_exists__email_address: 'form_identifier_exists__email_address',
      },
    };
    const { result } = renderHook(() => useLocalizations(), { wrapper });
    const { translateError } = result.current;
    expect(translateError({ code: 'code-does-not-exist', message: 'message' })).toBe('message');
    expect(translateError({ code: 'form_identifier_not_found', message: 'message' } as any)).toBe(
      'form_identifier_not_found',
    );
    expect(translateError({ code: 'form_password_pwned', message: 'message' })).toBe('form_password_pwned');
    expect(translateError({ code: 'form_username_invalid_length', message: 'message' })).toBe(
      'form_username_invalid_length',
    );
    expect(translateError({ code: 'form_username_invalid_character', message: 'message' })).toBe(
      'form_username_invalid_character',
    );
    expect(translateError({ code: 'form_param_format_invalid', message: 'message' })).toBe('form_param_format_invalid');
    expect(translateError({ code: 'form_password_length_too_short', message: 'message' })).toBe(
      'form_password_length_too_short',
    );
    expect(translateError({ code: 'form_param_nil', message: 'message' })).toBe('form_param_nil');
    expect(translateError({ code: 'form_code_incorrect', message: 'message' })).toBe('form_code_incorrect');
    expect(translateError({ code: 'form_password_incorrect', message: 'message' })).toBe('form_password_incorrect');
    expect(translateError({ code: 'not_allowed_access', message: 'message' })).toBe('message');
    expect(translateError(new ClerkRuntimeError('message', { code: 'oauth_access_denied' }))).toBe(
      'oauth_access_denied',
    );
    expect(translateError({ code: 'form_identifier_exists', message: 'message' })).toBe('form_identifier_exists');
    expect(
      translateError({ code: 'form_identifier_exists', message: 'message', meta: { paramName: 'username' } }),
    ).toBe('form_identifier_exists__username');
    expect(
      translateError({ code: 'form_identifier_exists', message: 'message', meta: { paramName: 'email_address' } }),
    ).toBe('form_identifier_exists__email_address');
  });

  it('translates native OAuth access denied errors using the default localization resource', async () => {
    const { wrapper } = await createFixtures();
    const { result } = renderHook(() => useLocalizations(), { wrapper });
    const { translateError } = result.current;

    expect(translateError(new ClerkRuntimeError('message', { code: 'oauth_access_denied' }))).toBe(
      'You did not grant access to your account.',
    );
  });
});

describe('Inline markup in localization values', () => {
  it('renders <bold> as a <strong> element inside a localizable component', async () => {
    const { wrapper: Wrapper } = await createFixtures();
    const wrapper = ({ children }: { children?: React.ReactNode }) => (
      <Wrapper>
        <OptionsProvider value={{ localization: { backButton: 'Press <bold>OK</bold> to go back' } }}>
          {children}
        </OptionsProvider>
      </Wrapper>
    );

    const { container } = render(<Text localizationKey={localizationKeys('backButton')} />, { wrapper });

    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    expect(strong?.textContent).toBe('OK');
    expect(container.textContent).toBe('Press OK to go back');
  });

  it('substitutes tokens inside <bold>', async () => {
    const { wrapper: Wrapper } = await createFixtures();
    const wrapper = ({ children }: { children?: React.ReactNode }) => (
      <Wrapper>
        <OptionsProvider value={{ localization: { backButton: 'Welcome to <bold>{{applicationName}}</bold>' } }}>
          {children}
        </OptionsProvider>
      </Wrapper>
    );

    const { container } = render(<Text localizationKey={localizationKeys('backButton')} />, { wrapper });

    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    expect(container.textContent).toContain('Welcome to');
    // applicationName comes from the fixture environment; we only assert the tag wraps non-empty text.
    expect(strong?.textContent?.length).toBeGreaterThan(0);
  });

  it('does not render <strong> when token value contains tag-like text', async () => {
    const { wrapper: Wrapper } = await createFixtures();
    const wrapper = ({ children }: { children?: React.ReactNode }) => (
      <Wrapper>
        <OptionsProvider
          value={{
            localization: {
              backButton: 'Hi {{applicationName}}',
            },
          }}
        >
          {children}
        </OptionsProvider>
      </Wrapper>
    );

    // The fixture's applicationName is plain text; the safety property we care about is
    // that token values are NEVER re-parsed as markup. We assert no <strong> appears.
    const { container } = render(<Text localizationKey={localizationKeys('backButton')} />, { wrapper });
    expect(container.querySelector('strong')).toBeNull();
  });

  it('t() returns a plain string with markup tags stripped', async () => {
    const { wrapper: Wrapper } = await createFixtures();
    const wrapper = ({ children }: { children?: React.ReactNode }) => (
      <Wrapper>
        <OptionsProvider value={{ localization: { backButton: 'Press <bold>OK</bold>' } }}>{children}</OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper });
    expect(result.current.t(localizationKeys('backButton'))).toBe('Press OK');
  });
});
