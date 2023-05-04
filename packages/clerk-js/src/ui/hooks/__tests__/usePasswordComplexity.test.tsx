import { act, bindCreateFixtures, renderHook } from '../../../testUtils';
import { usePasswordComplexity } from '../usePasswordComplexity';

const { createFixtures } = bindCreateFixtures('SignIn');

const defaultRenderer = () =>
  usePasswordComplexity({
    allowed_special_characters: '',
    max_length: 999,
    min_length: 8,
    require_special_char: true,
    require_numbers: true,
    require_lowercase: true,
    require_uppercase: true,
  });

describe('usePasswordComplexity', () => {
  it('internal passwords updates after calling setPassword', async () => {
    const { wrapper } = await createFixtures();
    const { result } = renderHook(defaultRenderer, { wrapper });

    await act(() => {
      result.current.setPassword('password1');
    });

    expect(result.current.password).toBe('password1');
  });

  it('password fails and hasFailedComplexity is true', async () => {
    const { wrapper } = await createFixtures();
    const { result } = renderHook(defaultRenderer, { wrapper });

    await act(() => {
      result.current.setPassword('thispasswordfails');
    });

    expect(result.current.hasFailedComplexity).toBe(true);
    expect(result.current.hasPassedComplexity).toBe(false);
  });

  it('password passes and hasPassedComplexity is true', async () => {
    const { wrapper } = await createFixtures();
    const { result } = renderHook(defaultRenderer, { wrapper });

    await act(() => {
      result.current.setPassword('th1sp@sswordPasses');
    });

    expect(result.current.hasFailedComplexity).toBe(false);
    expect(result.current.hasPassedComplexity).toBe(true);
  });

  it('returns object with the missing requirements as properties', async () => {
    const { wrapper } = await createFixtures();
    const { result } = renderHook(defaultRenderer, { wrapper });

    await act(() => {
      result.current.setPassword('thispasswordfails');
    });

    expect(result.current.failedValidations).toHaveProperty('require_uppercase');
    expect(result.current.failedValidations).toHaveProperty('require_numbers');
    expect(result.current.failedValidations).toHaveProperty('require_special_char');
    expect(result.current.failedValidations).not.toHaveProperty('require_lowercase');
    expect(result.current.failedValidations).not.toHaveProperty('max_length');
    expect(result.current.failedValidations).not.toHaveProperty('min_length');

    await act(() => {
      result.current.setPassword(`thispasswordfails"`);
    });

    expect(result.current.failedValidations).not.toHaveProperty('require_special_char');
  });

  it('uses allowed_special_character from environment', async () => {
    const { wrapper, fixtures } = await createFixtures(f =>
      f.withPasswordComplexity({
        allowed_special_characters: '@',
        max_length: 999,
        min_length: 8,
        require_special_char: true,
        require_numbers: true,
        require_lowercase: true,
        require_uppercase: true,
      }),
    );
    const { result } = renderHook(() => usePasswordComplexity(fixtures.environment.userSettings.passwordSettings), {
      wrapper,
    });

    await act(() => {
      result.current.setPassword('@');
    });

    expect(result.current.failedValidations).not.toHaveProperty('require_special_char');
  });

  it('uses allowed_special_character from environment with escaped characters', async () => {
    const { wrapper, fixtures } = await createFixtures(f =>
      f.withPasswordComplexity({
        allowed_special_characters: '[!"#$%&\'()*+,-./:;<=>?@^_`{|}~]',
        max_length: 999,
        min_length: 8,
        require_special_char: true,
        require_numbers: true,
        require_lowercase: true,
        require_uppercase: true,
      }),
    );
    const { result } = renderHook(() => usePasswordComplexity(fixtures.environment.userSettings.passwordSettings), {
      wrapper,
    });

    await act(() => {
      result.current.setPassword('[');
    });

    expect(result.current.failedValidations).not.toHaveProperty('require_special_char');

    await act(() => {
      result.current.setPassword(']');
    });

    expect(result.current.failedValidations).not.toHaveProperty('require_special_char');

    await act(() => {
      result.current.setPassword('[test]');
    });

    expect(result.current.failedValidations).not.toHaveProperty('require_special_char');

    await act(() => {
      result.current.setPassword('test[]');
    });

    expect(result.current.failedValidations).not.toHaveProperty('require_special_char');

    await act(() => {
      result.current.setPassword('[!"#$%&\'()*+,-./:;<=>?@^_`{|}~]');
    });

    expect(result.current.failedValidations).not.toHaveProperty('require_special_char');
  });

  it('returns an object with all validations and their status (true:passed, false:failed)', async () => {
    const { wrapper } = await createFixtures();
    const { result } = renderHook(defaultRenderer, { wrapper });

    await act(() => {
      result.current.setPassword('thispasswordfails');
    });

    expect(result.current.passwordComplexity).toMatchObject({
      max_length: true,
      min_length: true,
      require_special_char: false,
      require_numbers: false,
      require_lowercase: true,
      require_uppercase: false,
    });
  });

  it('returns error message with localized conjunction', async () => {
    const { wrapper } = await createFixtures();
    const { result } = renderHook(defaultRenderer, { wrapper });

    await act(() => {
      result.current.setPassword('@aP');
    });

    expect(result.current.failedValidationsText).toBe('Your password must contain 8 or more characters and a number');

    await act(() => {
      result.current.setPassword('aP');
    });

    expect(result.current.failedValidationsText).toBe(
      'Your password must contain 8 or more characters, a special character, and a number',
    );
  });
});
