import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '../field';
import { PhoneInput } from './phone-input';

describe('Mosaic PhoneInput', () => {
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

  it('keeps the country indicator on the selection while hovering another country', async () => {
    const user = userEvent.setup();
    render(<PhoneInput aria-label='Phone number' />);
    await user.click(screen.getByRole('button', { name: 'Country, United States' }));
    const us = screen.getByRole('option', { name: /United States/ });
    const uk = screen.getByRole('option', { name: /United Kingdom/ });
    await user.hover(uk);
    expect(us.querySelector('.cl-combobox-option-indicator')).toBeVisible();
    expect(uk.querySelector('.cl-combobox-option-indicator')).not.toBeInTheDocument();
    await user.click(uk);
    await user.click(screen.getByRole('button', { name: 'Country, United Kingdom' }));
    expect(
      screen.getByRole('option', { name: /United Kingdom/ }).querySelector('.cl-combobox-option-indicator'),
    ).toBeVisible();
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
