import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';
import { usePasswordComplexity } from '@/ui/hooks/usePasswordComplexity';

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
      result.current.getComplexity('password1');
    });

    expect(result.current.password).toBe('password1');
  });

  it('password fails and hasFailedComplexity is true', async () => {
    const { wrapper } = await createFixtures();
    const { result } = renderHook(defaultRenderer, { wrapper });

    await act(() => {
      result.current.getComplexity('thispasswordfails');
    });

    expect(result.current.hasFailedComplexity).toBe(true);
    expect(result.current.hasPassedComplexity).toBe(false);
  });

  it('password passes and hasPassedComplexity is true', async () => {
    const { wrapper } = await createFixtures();
    const { result } = renderHook(defaultRenderer, { wrapper });

    await act(() => {
      result.current.getComplexity('th1sp@sswordPasses');
    });

    expect(result.current.hasFailedComplexity).toBe(false);
    expect(result.current.hasPassedComplexity).toBe(true);
  });

  it('returns object with the missing requirements as properties', async () => {
    const { wrapper } = await createFixtures();
    const { result } = renderHook(defaultRenderer, { wrapper });

    await act(() => {
      result.current.getComplexity('thispasswordfails');
    });

    expect(result.current.failedValidations).toHaveProperty('require_uppercase');
    expect(result.current.failedValidations).toHaveProperty('require_numbers');
    expect(result.current.failedValidations).toHaveProperty('require_special_char');
    expect(result.current.failedValidations).not.toHaveProperty('require_lowercase');
    expect(result.current.failedValidations).not.toHaveProperty('max_length');
    expect(result.current.failedValidations).not.toHaveProperty('min_length');

    await act(() => {
      result.current.getComplexity(`thispasswordfails"`);
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
      result.current.getComplexity('@');
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
      result.current.getComplexity('[');
    });

    expect(result.current.failedValidations).not.toHaveProperty('require_special_char');

    await act(() => {
      result.current.getComplexity(']');
    });

    expect(result.current.failedValidations).not.toHaveProperty('require_special_char');

    await act(() => {
      result.current.getComplexity('[test]');
    });

    expect(result.current.failedValidations).not.toHaveProperty('require_special_char');

    await act(() => {
      result.current.getComplexity('test[]');
    });

    expect(result.current.failedValidations).not.toHaveProperty('require_special_char');

    await act(() => {
      result.current.getComplexity('[!"#$%&\'()*+,-./:;<=>?@^_`{|}~]');
    });

    expect(result.current.failedValidations).not.toHaveProperty('require_special_char');
  });

  it('returns error message with localized conjunction', async () => {
    const { wrapper } = await createFixtures();
    const { result } = renderHook(defaultRenderer, { wrapper });

    await act(() => {
      result.current.getComplexity('@apapapap');
    });

    expect(result.current.failedValidationsText).toBe('Your password must contain a number and an uppercase letter.');

    await act(() => {
      result.current.getComplexity('aPaPaPaPaP');
    });

    expect(result.current.failedValidationsText).toBe('Your password must contain a special character and a number.');

    await act(() => {
      result.current.getComplexity('aP');
    });

    expect(result.current.failedValidationsText).toBe('Your password must contain 8 or more characters.');
  });
});
