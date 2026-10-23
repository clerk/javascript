import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '../field';
import { PhoneInput } from './phone-input';

describe('Mosaic PhoneInput', () => {
  it('opens the country picker from the keyboard and restores focus when dismissed', async () => {
    const user = userEvent.setup();
    render(<PhoneInput aria-label='Phone number' />);
    const trigger = screen.getByRole('button', { name: 'Country, United States' });

    await user.tab();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveTextContent('🇺🇸');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Search countries' })).toHaveFocus());
    await user.keyboard('{Escape}');

    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('focuses the country search when opened with a pointer', async () => {
    const user = userEvent.setup();
    render(<PhoneInput aria-label='Phone number' />);

    await user.click(screen.getByRole('button', { name: 'Country, United States' }));

    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Search countries' })).toHaveFocus());
  });

  it('forwards object refs and clears them on unmount', () => {
    const ref = React.createRef<HTMLInputElement>();
    const { unmount } = render(
      <PhoneInput
        ref={ref}
        aria-label='Phone number'
      />,
    );
    expect(ref.current).toBe(screen.getByRole('textbox'));
    unmount();
    expect(ref.current).toBeNull();
  });

  it('forwards callback refs and clears them on unmount', () => {
    const ref = vi.fn();
    const { unmount } = render(
      <PhoneInput
        ref={ref}
        aria-label='Phone number'
      />,
    );
    expect(ref).toHaveBeenLastCalledWith(screen.getByRole('textbox'));
    unmount();
    expect(ref).toHaveBeenLastCalledWith(null);
  });

  it('positions the country popup against the full phone field', async () => {
    const user = userEvent.setup();
    render(<PhoneInput aria-label='Phone number' />);
    const group = screen.getByRole('textbox', { name: 'Phone number' }).closest('.cl-phone-input');
    if (!group) {
      throw new Error('Phone input group missing');
    }
    const measureGroup = vi.spyOn(group, 'getBoundingClientRect');

    await user.click(screen.getByRole('button', { name: 'Country, United States' }));

    await waitFor(() => expect(measureGroup).toHaveBeenCalled());
    expect(document.querySelector('.cl-phone-input-popup')).toHaveAttribute('data-size', 'anchor');
  });

  it.each(['sm', 'md', 'lg'] as const)('uses an xs country trigger for a %s input', size => {
    render(
      <PhoneInput
        size={size}
        aria-label='Phone number'
      />,
    );
    expect(screen.getByRole('button', { name: 'Country, United States' })).toHaveAttribute('data-size', 'xs');
    expect(screen.getByRole('button', { name: 'Country, United States' })).toHaveAttribute('data-shape', 'default');
  });
  it('renders one grouped telephone control with the default country', () => {
    render(<PhoneInput aria-label='Phone number' />);

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    expect(input).toHaveAttribute('type', 'tel');
    expect(input).toHaveAttribute('autocomplete', 'tel-national');
    expect(input).toHaveClass('cl-input', 'cl-phone-input-control');
    expect(input).toHaveAttribute('data-variant', 'ghost');
    const countryTrigger = screen.getByRole('button', { name: 'Country, United States' });
    expect(countryTrigger).toHaveClass('cl-button', 'cl-phone-input-country-trigger');
    expect(countryTrigger.closest('.cl-input-group-start')).not.toBeNull();
    expect(countryTrigger).toHaveAttribute('data-size', 'xs');
    expect(countryTrigger).toHaveAttribute('data-variant', 'ghost');
    expect(screen.queryByText('us')).not.toBeInTheDocument();
    expect(document.querySelector('.cl-phone-input-divider')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('+1')).toHaveClass('cl-phone-input-prefix');
    expect(document.querySelector('.cl-phone-input')).toHaveClass('cl-input-group');
    expect(document.querySelector('.cl-phone-input')).toHaveAttribute('data-size', 'md');
  });

  it('starts on the given default country and dials the number with its code', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <PhoneInput
        defaultCountry='de'
        aria-label='Phone number'
        onValueChange={onValueChange}
      />,
    );

    expect(screen.getByRole('button', { name: 'Country, Germany' })).toBeInTheDocument();
    expect(screen.getByText('+49')).toHaveClass('cl-phone-input-prefix');

    await user.type(screen.getByRole('textbox', { name: 'Phone number' }), '15123456789');

    expect(onValueChange).toHaveBeenLastCalledWith('+4915123456789');
  });

  it('prefers the number it is given over the default country', () => {
    render(
      <PhoneInput
        defaultCountry='de'
        defaultValue='+18015550100'
        aria-label='Phone number'
      />,
    );

    expect(screen.getByRole('button', { name: 'Country, United States' })).toBeInTheDocument();
  });

  it('emits an E.164 value while displaying the national number', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <PhoneInput
        aria-label='Phone number'
        onValueChange={onValueChange}
      />,
    );

    await user.type(screen.getByRole('textbox', { name: 'Phone number' }), '202 555 0123');

    expect(screen.getByRole('textbox', { name: 'Phone number' })).toHaveValue('(202) 555-0123');
    expect(onValueChange).toHaveBeenLastCalledWith('+12025550123');
  });

  it('searches countries, preserves the number, and returns focus after selection', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onCountryChange = vi.fn();
    render(
      <PhoneInput
        aria-label='Phone number'
        defaultValue='+12025550123'
        onValueChange={onValueChange}
        onCountryChange={onCountryChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Country, United States' }));
    const searchInput = screen.getByRole('combobox', { name: 'Search countries' });
    expect(searchInput).toHaveClass('cl-combobox-input', 'cl-input');
    expect(searchInput).toHaveAttribute('data-variant', 'ghost');
    expect(searchInput.closest('.cl-input-group')).toHaveClass('cl-phone-input-country-search');
    await user.type(searchInput, 'Greece');
    expect(screen.getByRole('listbox')).toHaveClass('cl-combobox-list');
    expect(screen.getByRole('option', { name: /Greece/ })).toHaveClass('cl-combobox-option');
    await user.keyboard('{ArrowDown}{Enter}');

    expect(screen.getByRole('button', { name: 'Country, Greece' })).toBeInTheDocument();
    expect(screen.getByText('+30')).toHaveClass('cl-phone-input-prefix');
    expect(onCountryChange).toHaveBeenCalledWith('gr');
    expect(onValueChange).toHaveBeenLastCalledWith('+302025550123');
    expect(screen.getByRole('textbox', { name: 'Phone number' })).toHaveFocus();
  });

  it('clears the country search when the popup is dismissed', async () => {
    const user = userEvent.setup();
    render(<PhoneInput aria-label='Phone number' />);

    await user.click(screen.getByRole('button', { name: 'Country, United States' }));
    await user.type(screen.getByRole('combobox', { name: 'Search countries' }), 'Greece');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('combobox', { name: 'Search countries' })).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Country, United States' }));

    expect(screen.getByRole('combobox', { name: 'Search countries' })).toHaveValue('');
  });

  it('clears the country search after a country is chosen', async () => {
    const user = userEvent.setup();
    render(<PhoneInput aria-label='Phone number' />);

    await user.click(screen.getByRole('button', { name: 'Country, United States' }));
    await user.type(screen.getByRole('combobox', { name: 'Search countries' }), 'Greece');
    await user.keyboard('{ArrowDown}{Enter}');
    await user.click(screen.getByRole('button', { name: 'Country, Greece' }));

    expect(screen.getByRole('combobox', { name: 'Search countries' })).toHaveValue('');
  });

  it('renders the country list inside the popup', async () => {
    const user = userEvent.setup();
    render(<PhoneInput aria-label='Phone number' />);

    await user.click(screen.getByRole('button', { name: 'Country, United States' }));

    const popup = document.querySelector('.cl-phone-input-popup');
    const list = screen.getByRole('listbox');
    expect(popup).toBeInTheDocument();
    expect(popup).toContainElement(list);
  });

  it('keeps the country search in its own Field scope', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(
      <Field.Root>
        <Field.Label>Phone number</Field.Label>
        <PhoneInput />
      </Field.Root>,
    );

    await user.click(screen.getByRole('button', { name: 'Country, United States' }));

    expect(screen.getByRole('combobox', { name: 'Search countries' })).toBeInTheDocument();
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('supports a single form control'));
    warn.mockRestore();
  });

  it('parses a pasted international number', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <PhoneInput
        aria-label='Phone number'
        onValueChange={onValueChange}
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.click(input);
    await user.paste('+30 690 123 4567');

    expect(screen.getByRole('button', { name: 'Country, Greece' })).toBeInTheDocument();
    expect(input).toHaveValue('690 1234567');
    expect(onValueChange).toHaveBeenLastCalledWith('+306901234567');
  });

  it('keeps the caret after a digit inserted mid-number', async () => {
    const user = userEvent.setup();
    render(
      <PhoneInput
        aria-label='Phone number'
        defaultValue='+1202555012'
      />,
    );

    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Phone number' });
    await user.click(input);
    input.setSelectionRange(1, 1);
    await user.keyboard('9');

    expect(input).toHaveValue('(920) 255-5012');
    expect(input.selectionStart).toBe(2);
  });

  it('stores only the digits it displays', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <PhoneInput
        aria-label='Phone number'
        onValueChange={onValueChange}
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.type(input, '2025550123456789');

    expect(input).toHaveValue('(202) 555-01234567');
    expect(onValueChange).toHaveBeenLastCalledWith('+120255501234567');
  });

  it('caps a number without a pattern at the E.164 length', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <PhoneInput
        aria-label='Phone number'
        defaultCountry='af'
        onValueChange={onValueChange}
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.type(input, '1234567890123456');

    expect(input).toHaveValue('1234567890123');
    expect(onValueChange).toHaveBeenLastCalledWith('+931234567890123');
  });

  it('keeps a chosen country that shares its calling code while a controlled number is typed', async () => {
    const user = userEvent.setup();
    function ControlledPhoneInput() {
      const [value, setValue] = React.useState('');
      return (
        <PhoneInput
          aria-label='Phone number'
          defaultCountry='ca'
          value={value}
          onValueChange={setValue}
        />
      );
    }
    render(<ControlledPhoneInput />);

    await user.type(screen.getByRole('textbox', { name: 'Phone number' }), '6045');

    expect(screen.getByRole('button', { name: 'Country, Canada' })).toBeInTheDocument();
  });

  it('follows an outside value from another calling code', () => {
    const { rerender } = render(
      <PhoneInput
        aria-label='Phone number'
        value='+12025550123'
      />,
    );

    rerender(
      <PhoneInput
        aria-label='Phone number'
        value='+306901234567'
      />,
    );

    expect(screen.getByRole('button', { name: 'Country, Greece' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Phone number' })).toHaveValue('690 1234567');
  });

  it('follows an outside value from another country with the same calling code', () => {
    const { rerender } = render(
      <PhoneInput
        aria-label='Phone number'
        value='+12025550123'
      />,
    );

    rerender(
      <PhoneInput
        aria-label='Phone number'
        value='+16045551234'
      />,
    );

    expect(screen.getByRole('button', { name: 'Country, Canada' })).toBeInTheDocument();
  });

  it('follows an outside value that restores a number typed earlier', async () => {
    const user = userEvent.setup();
    function ControlledPhoneInput() {
      const [value, setValue] = React.useState('');
      return (
        <>
          <PhoneInput
            aria-label='Phone number'
            value={value}
            onValueChange={setValue}
          />
          <button
            type='button'
            onClick={() => setValue('+306901234567')}
          >
            Use Greek number
          </button>
          <button
            type='button'
            onClick={() => setValue('+12025550123')}
          >
            Use US number
          </button>
        </>
      );
    }
    render(<ControlledPhoneInput />);

    await user.type(screen.getByRole('textbox', { name: 'Phone number' }), '2025550123');
    await user.click(screen.getByRole('button', { name: 'Use Greek number' }));
    await user.click(screen.getByRole('button', { name: 'Use US number' }));

    expect(screen.getByRole('button', { name: 'Country, United States' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Phone number' })).toHaveValue('(202) 555-0123');
  });

  it('submits the normalized value through a hidden input', async () => {
    const user = userEvent.setup();
    render(
      <form data-testid='form'>
        <PhoneInput
          name='phoneNumber'
          aria-label='Phone number'
        />
      </form>,
    );

    await user.type(screen.getByRole('textbox', { name: 'Phone number' }), '2025550123');

    const form = screen.getByTestId('form');
    if (!(form instanceof HTMLFormElement)) {
      throw new Error('Expected a form element');
    }
    expect(new FormData(form).get('phoneNumber')).toBe('+12025550123');
  });

  it('inherits Field state and associates its label and messages with the telephone input', () => {
    render(
      <Field.Root
        disabled
        required
        invalid
      >
        <Field.Label>Phone number</Field.Label>
        <PhoneInput />
        <Field.Error>Enter a valid phone number</Field.Error>
      </Field.Root>,
    );

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter a valid phone number');
    expect(screen.getByRole('button', { name: 'Country, United States' })).toBeDisabled();
    expect(document.querySelector('.cl-phone-input')).toHaveAttribute('data-disabled', '');
    expect(document.querySelector('.cl-phone-input')).toHaveAttribute('data-invalid', '');
  });

  it.each(['sm', 'md', 'lg'] as const)('reflects the %s size', size => {
    render(
      <PhoneInput
        size={size}
        aria-label='Phone number'
      />,
    );

    expect(document.querySelector('.cl-phone-input')).toHaveAttribute('data-size', size);
  });

  it('supports controlled values', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <PhoneInput
        value='+12025550123'
        onValueChange={onValueChange}
        aria-label='Phone number'
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    expect(input).toHaveValue('(202) 555-0123');

    await user.type(input, '4');

    expect(onValueChange).toHaveBeenLastCalledWith('+120255501234');
    expect(input).toHaveValue('(202) 555-0123');
  });
});
