import React from 'react';

import { renderHook } from '../../../testUtils';
import { OptionsProvider } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';
import { bindCreateFixtures } from '../../utils/test/createFixtures';
import { defaultResource } from '../defaultEnglishResource';

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
});
