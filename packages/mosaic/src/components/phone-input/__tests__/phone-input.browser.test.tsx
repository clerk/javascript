import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { PhoneInput } from '../phone-input';

afterEach(() => cleanup());

const labels = {
  countryTriggerLabel: 'Country, {country}',
  countryPopupLabel: 'Choose a country',
  countrySearchLabel: 'Search countries',
};

describe('PhoneInput', () => {
  it('keeps the country code before the number in a right-to-left layout', () => {
    render(
      <div dir='rtl'>
        <PhoneInput
          {...labels}
          aria-label='Phone number'
        />
      </div>,
    );

    const prefix = screen.getByText(/^\+\d+$/).getBoundingClientRect();
    const input = screen.getByRole('textbox', { name: 'Phone number' }).getBoundingClientRect();
    expect(prefix.right).toBeLessThanOrEqual(input.left + 1);
  });
});
