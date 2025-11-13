import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, renderHook, screen } from '@/test/utils';
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
    expect(translateError({ code: 'form_identifier_exists', message: 'message' })).toBe('form_identifier_exists');
    expect(
      translateError({ code: 'form_identifier_exists', message: 'message', meta: { paramName: 'username' } }),
    ).toBe('form_identifier_exists__username');
    expect(
      translateError({ code: 'form_identifier_exists', message: 'message', meta: { paramName: 'email_address' } }),
    ).toBe('form_identifier_exists__email_address');
  });
});
