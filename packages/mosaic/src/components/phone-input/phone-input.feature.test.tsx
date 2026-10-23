import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { MosaicProvider } from '../../mosaic-provider';
import { PhoneInput } from './phone-input';

describe('PhoneInput country picker alignment', () => {
  it.each(['sm', 'md', 'lg'] as const)('aligns search text and country flags for a %s input', async size => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <div style={{ width: 320, margin: 32 }}>
          <PhoneInput
            size={size}
            aria-label='Phone number'
          />
        </div>
      </MosaicProvider>,
    );
    const trigger = screen.getByRole('button', { name: 'Country, United States' });
    await user.click(trigger);
    const search = screen.getByRole('combobox', { name: 'Search countries' });
    await waitFor(() => expect(search).toHaveFocus());
    const country = screen.getByRole('option', { name: /United States/ });
    const countryName = document.createRange();
    countryName.selectNodeContents(within(country).getByText('United States'));
    const triggerFlag = document.createRange();
    triggerFlag.selectNodeContents(within(trigger).getByText('🇺🇸'));
    const countryFlag = document.createRange();
    countryFlag.selectNodeContents(within(country).getByText('🇺🇸'));

    const searchTextLeft =
      search.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(search).paddingLeft);
    expect(search.getBoundingClientRect().width).toBeGreaterThan(0);
    expect.soft(Math.abs(searchTextLeft - countryName.getBoundingClientRect().left)).toBeLessThanOrEqual(0.5);
    expect
      .soft(Math.abs(triggerFlag.getBoundingClientRect().left - countryFlag.getBoundingClientRect().left))
      .toBeLessThanOrEqual(0.5);
  });
});
