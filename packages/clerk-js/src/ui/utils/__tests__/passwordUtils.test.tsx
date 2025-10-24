import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { renderHook } from '@/test/utils';
import { OptionsProvider } from '@/ui/contexts';
import { useLocalizations } from '@/ui/customizables';
import { createPasswordError } from '@/ui/utils/passwordUtils';

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
