import React from 'react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { renderHook } from '@/test/utils';
import { OptionsProvider } from '@/ui/contexts';
import { localizationKeys, useLocalizations } from '@/ui/customizables';
import { defaultResource } from '@/ui/localization/defaultEnglishResource';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('Localization parsing and replacing', () => {
  it('Localization value returned from hook is equal to the value declared in the defaultResource when no localization options are passed', async () => {
    const { wrapper: Wrapper } = await createFixtures();
    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider value={{}}>{children}</OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });

    const localizedValue = result.current.t(localizationKeys('backButton'));
    expect(localizedValue).toBe(defaultResource.backButton);
  });

  it('Localization value returned from hook is equal to the value declared in the defaultResource', async () => {
    const { wrapper: Wrapper } = await createFixtures();
    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider value={{ localization: { backButton: 'test' } }}>{children}</OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });

    const localizedValue = result.current.t(localizationKeys('backButton'));
    expect(localizedValue).toBe('test');
  });

  it('falls back to English when user locale has undefined value for a key', async () => {
    const { wrapper: Wrapper } = await createFixtures();
    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider
          value={{
            localization: {
              backButton: undefined, // Explicitly undefined should fall back to English
              formButtonPrimary: 'Translated', // Non-undefined should override
            },
          }}
        >
          {children}
        </OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });

    // undefined value should fall back to English
    const backButtonValue = result.current.t(localizationKeys('backButton'));
    expect(backButtonValue).toBe(defaultResource.backButton);

    // Non-undefined value should use the translation
    const formButtonValue = result.current.t(localizationKeys('formButtonPrimary'));
    expect(formButtonValue).toBe('Translated');
  });

  it('falls back to English for nested keys with undefined values', async () => {
    const { wrapper: Wrapper } = await createFixtures();
    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider
          value={{
            localization: {
              signIn: {
                start: {
                  title: undefined, // Should fall back to English
                  subtitle: 'Custom subtitle', // Should use translation
                },
              },
            },
          }}
        >
          {children}
        </OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });

    // undefined nested value should fall back to English (tokens get replaced by t())
    const titleValue = result.current.t(localizationKeys('signIn.start.title'));
    // The English default is 'Sign in to {{applicationName}}', tokens get replaced
    expect(titleValue).toContain('Sign in to');

    // Non-undefined nested value should use the translation
    const subtitleValue = result.current.t(localizationKeys('signIn.start.subtitle'));
    expect(subtitleValue).toBe('Custom subtitle');
  });
});
