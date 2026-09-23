import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { renderHook } from '@/test/utils';
import { OptionsProvider } from '@/ui/contexts';
import { useLocalizations } from '@/ui/customizables';
import { createPasswordConfirmationError, createPasswordError } from '@/ui/utils/passwordUtils';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('createPasswordError() constructs error that password', () => {
  const createLocalizationConfig = t => ({
    t,
    locale: 'en-US',
    passwordSettings: { max_length: 72, min_length: 8 },
  });

  it('is too short', async () => {
    const { wrapper: Wrapper } = await createFixtures();

    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider value={{ localization: {} }}>{children}</OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });

    const res = createPasswordError(
      [{ code: 'form_password_length_too_short', message: '' }],
      createLocalizationConfig(result.current.t),
    );
    expect(res).toBe('Your password must contain 8 or more characters.');
  });

  it('is too short and needs an uppercase character. Shows only min_length error.', async () => {
    const { wrapper: Wrapper } = await createFixtures();

    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider value={{ localization: {} }}>{children}</OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });

    const res = createPasswordError(
      [
        { code: 'form_password_length_too_short', message: '' },
        { code: 'form_password_no_uppercase', message: '' },
      ],
      createLocalizationConfig(result.current.t),
    );
    expect(res).toBe('Your password must contain 8 or more characters.');
  });

  it('needs an uppercase character', async () => {
    const { wrapper: Wrapper } = await createFixtures();

    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider value={{ localization: {} }}>{children}</OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });

    const res = createPasswordError(
      [{ code: 'form_password_no_uppercase', message: '' }],
      createLocalizationConfig(result.current.t),
    );
    expect(res).toBe('Your password must contain an uppercase letter.');
  });

  it('is too short and needs an lowercase character. Shows only min_length error', async () => {
    const { wrapper: Wrapper } = await createFixtures();

    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider value={{ localization: {} }}>{children}</OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });

    const res = createPasswordError(
      [
        { code: 'form_password_length_too_short', message: '' },
        { code: 'form_password_no_lowercase', message: '' },
      ],
      createLocalizationConfig(result.current.t),
    );
    expect(res).toBe('Your password must contain 8 or more characters.');
  });

  it('needs a lowercase and an uppercase character', async () => {
    const { wrapper: Wrapper } = await createFixtures();

    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider value={{ localization: {} }}>{children}</OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });

    const res = createPasswordError(
      [
        { code: 'form_password_no_lowercase', message: '' },
        { code: 'form_password_no_uppercase', message: '' },
      ],
      createLocalizationConfig(result.current.t),
    );
    expect(res).toBe('Your password must contain a lowercase letter and an uppercase letter.');
  });

  it('needs a lowercase, an uppercase and a number', async () => {
    const { wrapper: Wrapper } = await createFixtures();

    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider value={{ localization: {} }}>{children}</OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });

    const res = createPasswordError(
      [
        { code: 'form_password_no_number', message: '' },
        { code: 'form_password_no_lowercase', message: '' },
        { code: 'form_password_no_uppercase', message: '' },
      ],
      createLocalizationConfig(result.current.t),
    );
    expect(res).toBe('Your password must contain a number, a lowercase letter, and an uppercase letter.');
  });

  it('needs a lowercase, an uppercase and a number', async () => {
    const { wrapper: Wrapper } = await createFixtures();

    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider value={{ localization: {} }}>{children}</OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });

    const res = createPasswordError(
      [
        { code: 'form_password_no_special_char', message: '' },
        { code: 'form_password_no_number', message: '' },
        { code: 'form_password_no_lowercase', message: '' },
        { code: 'form_password_no_uppercase', message: '' },
      ],
      createLocalizationConfig(result.current.t),
    );
    expect(res).toBe(
      'Your password must contain a special character, a number, a lowercase letter, and an uppercase letter.',
    );
  });

  //
  // zxcvbn
  //
  //
  it('is not strong enough', async () => {
    const { wrapper: Wrapper } = await createFixtures();

    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider value={{ localization: {} }}>{children}</OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });

    const res = createPasswordError(
      [
        {
          code: 'form_password_not_strong_enough',
          message: '',
          meta: {
            zxcvbn: {
              suggestions: [{ code: 'anotherWord', message: '' }],
            },
          },
        },
      ],
      createLocalizationConfig(result.current.t),
    );
    expect(res).toBe('Your password is not strong enough. Add more words that are less common.');
  });

  it('is not strong enough and has repeated characters', async () => {
    const { wrapper: Wrapper } = await createFixtures();

    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider value={{ localization: {} }}>{children}</OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });

    const res = createPasswordError(
      [
        {
          code: 'form_password_not_strong_enough',
          message: '',
          meta: {
            zxcvbn: {
              suggestions: [
                { code: 'anotherWord', message: '' },
                { code: 'repeated', message: '' },
              ],
            },
          },
        },
      ],
      createLocalizationConfig(result.current.t),
    );
    expect(res).toBe(
      'Your password is not strong enough. Add more words that are less common. Avoid repeated words and characters.',
    );
  });
});

describe('createPasswordConfirmationError()', () => {
  const renderLocalizations = async (localization = {}) => {
    const { wrapper: Wrapper } = await createFixtures();
    const wrapper = ({ children }) => (
      <Wrapper>
        <OptionsProvider value={{ localization }}>{children}</OptionsProvider>
      </Wrapper>
    );
    return renderHook(() => useLocalizations(), { wrapper }).result;
  };

  it.each([
    [2, 'Incorrect password. You have 2 attempts remaining.'],
    [1, 'Incorrect password. You have 1 attempt remaining.'],
    [
      0,
      'Your session has ended because you reached the password confirmation attempt limit. Sign in again to continue.',
    ],
  ])('shows the countdown with %i attempts remaining', async (remainingAttempts, expected) => {
    const result = await renderLocalizations();

    const res = createPasswordConfirmationError(
      [{ code: 'form_password_validation_failed', message: 'Incorrect password', meta: { remainingAttempts } }],
      { t: result.current.t },
    );
    expect(res).toBe(expected);
  });

  it('uses customer translations for the countdown', async () => {
    const result = await renderLocalizations({
      unstable__errors: {
        password_confirmation_attempts_remaining: 'Mot de passe incorrect. {{remainingAttempts}} tentatives restantes.',
      },
    });

    const res = createPasswordConfirmationError(
      [{ code: 'form_password_incorrect', message: 'Incorrect password', meta: { remainingAttempts: 3 } }],
      { t: result.current.t },
    );
    expect(res).toBe('Mot de passe incorrect. 3 tentatives restantes.');
  });

  it('returns other errors unchanged', async () => {
    const result = await renderLocalizations();
    const error = { code: 'form_password_validation_failed', message: 'Incorrect password' };

    expect(createPasswordConfirmationError([error], { t: result.current.t })).toBe(error);
  });
});
