import React from 'react';

import { bindCreateFixtures, renderHook } from '../../../testUtils';
import { OptionsProvider } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';
import { defaultResource } from '../defaultEnglishResource';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('Localization parsing and replacing', () => {
  it('Localization value and locale returned from hook is equal to the value declared in the defaultResource when no localization options are passed', async () => {
    const { wrapper: Wrapper } = await createFixtures();
    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider value={{}}>{children}</OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });

    const localizedValue = result.current.t(localizationKeys('backButton'));
    expect(localizedValue).toBe(defaultResource.resources.backButton);
    const locale = result.current.locale;
    expect(locale).toBe('en-US');
  });

  it('Locale returned from hook is equal to the value declared in the defaultResource when no locale is provided and localization values exist', async () => {
    const { wrapper: Wrapper } = await createFixtures();
    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider value={{ localization: { backButton: 'test' } }}>{children}</OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });

    const localizedValue = result.current.t(localizationKeys('backButton'));
    expect(localizedValue).toBe('test');
    const locale = result.current.locale;
    expect(locale).toBe('en-US');
  });

  it('Localization value returned from hook is equal to the value declared in the provider', async () => {
    const { wrapper: Wrapper } = await createFixtures();
    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider value={{ localization: { locale: 'en-US', resources: { backButton: 'test' } } }}>
          {children}
        </OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });

    const localizedValue = result.current.t(localizationKeys('backButton'));
    expect(localizedValue).toBe('test');
  });

  it('locale value returned from hook is equal to the value declared in the provider', async () => {
    const { wrapper: Wrapper } = await createFixtures();
    const wrapperBefore = ({ children }) => (
      <Wrapper>
        <OptionsProvider value={{ localization: { locale: 'fr-FR', resources: {} } }}>{children}</OptionsProvider>
      </Wrapper>
    );

    const { result } = renderHook(() => useLocalizations(), { wrapper: wrapperBefore });
    const locale = result.current.locale;
    expect(locale).toBe('fr-FR');
  });
});
