import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '../field';
import { Switch } from './switch';
import { styles } from './switch.styles';

const atoms = stylex.create({
  spaced: { marginTop: '8px' },
});

describe('Mosaic Switch', () => {
  it('renders a native checkbox with the switch role wrapped in the slot element', () => {
    render(<Switch aria-label='Notifications' />);
    const input = screen.getByRole('switch', { name: 'Notifications' });
    expect(input).toHaveAttribute('type', 'checkbox');
    expect(input).toHaveClass('cl-switch-input');
    expect(input.parentElement).toHaveClass('cl-switch');
  });

  it('toggles on click and reports changes', async () => {
    const onChange = vi.fn();
    render(
      <Switch
        aria-label='Notifications'
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('switch');
    await userEvent.click(input);
    expect(input).toBeChecked();
    await userEvent.click(input);
    expect(input).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('toggles with the space key', async () => {
    render(<Switch aria-label='Notifications' />);
    const input = screen.getByRole('switch');
    input.focus();
    await userEvent.keyboard(' ');
    expect(input).toBeChecked();
  });

  it('starts on with defaultChecked', () => {
    render(
      <Switch
        aria-label='Notifications'
        defaultChecked
      />,
    );
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('follows a controlled checked state', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Switch
        aria-label='Notifications'
        checked={false}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('switch');
    await userEvent.click(input);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input).not.toBeChecked();

    rerender(
      <Switch
        aria-label='Notifications'
        checked
        onChange={onChange}
      />,
    );
    expect(input).toBeChecked();
  });

  it('reflects the size axis on the slot element', () => {
    render(
      <Switch
        aria-label='Notifications'
        size='sm'
      />,
    );
    expect(screen.getByRole('switch').parentElement).toHaveAttribute('data-size', 'sm');
  });

  it('defaults to the md size', () => {
    render(<Switch aria-label='Notifications' />);
    expect(screen.getByRole('switch').parentElement).toHaveAttribute('data-size', 'md');
  });

  it('disables the input and does not toggle', async () => {
    const onChange = vi.fn();
    render(
      <Switch
        aria-label='Notifications'
        disabled
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('switch');
    expect(input).toBeDisabled();
    expect(input.parentElement).toHaveAttribute('data-disabled');
    await userEvent.click(input);
    expect(input).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('merges xstyle atoms onto the slot element', () => {
    render(
      <Switch
        aria-label='Notifications'
        xstyle={atoms.spaced}
      />,
    );
    expect(screen.getByRole('switch').parentElement).toHaveClass(
      'cl-switch',
      stylex.props(atoms.spaced).className ?? '',
    );
  });

  it('widens the hit target on the input for coarse pointers', () => {
    render(<Switch aria-label='Notifications' />);
    expect(screen.getByRole('switch')).toHaveClass(stylex.props(styles.hitTarget).className ?? '');
  });

  it('forwards the ref and arbitrary input props to the input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <Switch
        ref={ref}
        aria-label='Notifications'
        name='notifications'
        value='on'
      />,
    );
    const input = screen.getByRole('switch');
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('name', 'notifications');
    expect(input).toHaveAttribute('value', 'on');
  });

  it('takes its label, description and state from a Field', async () => {
    render(
      <Field.Root
        orientation='horizontal'
        required
        invalid
      >
        <Switch />
        <Field.Content>
          <Field.Label>Email notifications</Field.Label>
          <Field.Description>Get an email when someone signs in.</Field.Description>
        </Field.Content>
      </Field.Root>,
    );

    const input = screen.getByRole('switch', { name: 'Email notifications' });
    expect(input).toHaveAttribute('aria-describedby', screen.getByText('Get an email when someone signs in.').id);
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await userEvent.click(screen.getByText('Email notifications'));
    expect(input).toBeChecked();
  });

  it('is disabled by a disabled Field', () => {
    render(
      <Field.Root disabled>
        <Switch />
        <Field.Label>Email notifications</Field.Label>
      </Field.Root>,
    );
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});
