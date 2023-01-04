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
});
