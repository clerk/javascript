import { act, render, renderJSON, screen, userEvent } from '@clerk/shared/testUtils';
import * as React from 'react';

import { PhoneInput } from './PhoneInput';

jest.mock('./countryCodeData', () => {
  return {
    IsoToCountryMap: new Map(
      Object.entries({
        us: {
          name: 'United States',
          iso: 'us',
          code: '1',
          pattern: '(...) ...-....',
        },
        gb: {
          name: 'United Kingdom',
          iso: 'gb',
          code: '44',
          pattern: '.... ......',
        },
        in: {
          name: 'India',
          iso: 'in',
          code: '91',
          pattern: '.....-.....',
        },
      }),
    ),
  };
});

describe('<PhoneInput/>', () => {
  let handlePhoneChange: jest.Mock;
  beforeEach(() => {
    handlePhoneChange = jest.fn();
  });

  it('renders the phone input', () => {
    const tree = renderJSON(<PhoneInput handlePhoneChange={handlePhoneChange} />);
    expect(tree).toMatchSnapshot();
  });

  it('renders the phone input when the dropdown is open', async () => {
    const { container } = render(<PhoneInput handlePhoneChange={handlePhoneChange} />);
    const countryOption = screen.getByText('United States');
    expect(countryOption).toBeInTheDocument();
    await userEvent.click(countryOption);

    expect(container).toMatchSnapshot();
  });

  it('input has the correct attributes', () => {
    render(<PhoneInput handlePhoneChange={handlePhoneChange} />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDefined();
    expect(input).toHaveAttribute('type', 'tel');
    expect(input).toHaveAttribute('maxlength', '25');
  });

  it('renders with an empty value', () => {
    render(<PhoneInput handlePhoneChange={handlePhoneChange} />);
    expect(handlePhoneChange).not.toHaveBeenCalled();
  });

  it('emits phone number with country code and no formatting', async () => {
    render(<PhoneInput handlePhoneChange={handlePhoneChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '2222222222');
    const lastCall = handlePhoneChange.mock.calls.pop();
    expect(lastCall).toEqual(['+12222222222']);
  });

  it('emits phone number when country code changes', async () => {
    render(<PhoneInput handlePhoneChange={handlePhoneChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '2222222222');

    const dropdownInput = screen.getAllByRole('combobox')[0];
    await userEvent.type(dropdownInput, 'united');

    const otherCountryOption = screen.getByText('United Kingdom');
    expect(otherCountryOption).toBeInTheDocument();
    expect(otherCountryOption).toBeVisible();
    await act(async () => await userEvent.click(otherCountryOption));
    await act(async () => await userEvent.dblClick(otherCountryOption));
    await userEvent.clear(input);
    const lastCall = handlePhoneChange.mock.calls.pop();
    expect(lastCall).toEqual(['+442222222222']);
  });

  it('filters list using country code', async () => {
    render(<PhoneInput handlePhoneChange={handlePhoneChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '2222222222');

    const dropdownInput = screen.getAllByRole('combobox')[0];
    await userEvent.type(dropdownInput, '44');

    const otherCountryOption = screen.getByText('United Kingdom');
    expect(otherCountryOption).toBeInTheDocument();
    expect(otherCountryOption).toBeVisible();
  });
});
