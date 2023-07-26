import { bindCreateFixtures, renderHook } from '../../testUtils';
import { OptionsProvider } from '../contexts';
import { useLocalizations } from '../customizables';
import { createPasswordError } from './passwordUtils';

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

  it('is too short and needs an uppercase character', async () => {
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
    expect(res).toBe('Your password must contain 8 or more characters and an uppercase letter.');
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
      [
        // { code: 'form_password_length_too_short', message: '' },
        { code: 'form_password_no_uppercase', message: '' },
      ],
      createLocalizationConfig(result.current.t),
    );
    expect(res).toBe('Your password must contain an uppercase letter.');
  });

  it('is too short and needs an lowercase character', async () => {
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
    expect(res).toBe('Your password must contain 8 or more characters and a lowercase letter.');
  });

  it('is too short and needs a lowercase and an uppercase character', async () => {
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
        { code: 'form_password_no_uppercase', message: '' },
      ],
      createLocalizationConfig(result.current.t),
    );
    expect(res).toBe('Your password must contain 8 or more characters, a lowercase letter, and an uppercase letter.');
  });

  it('is too short and needs a lowercase, an uppercase and a number', async () => {
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
        { code: 'form_password_no_number', message: '' },
        { code: 'form_password_no_lowercase', message: '' },
        { code: 'form_password_no_uppercase', message: '' },
      ],
      createLocalizationConfig(result.current.t),
    );
    expect(res).toBe(
      'Your password must contain 8 or more characters, a number, a lowercase letter, and an uppercase letter.',
    );
  });

  it('is too short and needs a lowercase, an uppercase and a number', async () => {
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
        { code: 'form_password_no_special_char', message: '' },
        { code: 'form_password_no_number', message: '' },
        { code: 'form_password_no_lowercase', message: '' },
        { code: 'form_password_no_uppercase', message: '' },
      ],
      createLocalizationConfig(result.current.t),
    );
    expect(res).toBe(
      'Your password must contain 8 or more characters, a special character, a number, a lowercase letter, and an uppercase letter.',
    );
  });
});
