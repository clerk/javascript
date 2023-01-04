import React from 'react';

import { bindCreateFixtures, render, renderHook, screen } from '../../../testUtils';
import {
  Badge,
  Button,
  FormErrorText,
  FormLabel,
  Heading,
  Link,
  localizationKeys,
  SimpleButton,
  Td,
  Text,
  Th,
  useLocalizations,
} from '../../customizables';

const { createFixtures } = bindCreateFixtures('SignIn');

const localizableElements = [
  { name: 'Badge', el: Badge },
  { name: 'Button', el: Button },
  { name: 'FormErrorText', el: FormErrorText },
  { name: 'FormLabel', el: FormLabel },
  { name: 'Heading', el: Heading },
  { name: 'Link', el: Link },
  { name: 'SimpleButton', el: SimpleButton },
  { name: 'Td', el: Td },
  { name: 'Th', el: Th },
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
});
