import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '../field';
import { Otp } from './otp';

const slots = () => screen.getAllByRole('textbox');

describe('Mosaic Otp', () => {
  it('renders one slot per character and applies the default variants', () => {
    render(
      <Otp
        length={6}
        aria-label='Verification code'
      />,
    );

    const group = screen.getByRole('group', { name: 'Verification code' });
    expect(group).toHaveClass('cl-otp');
    expect(group).toHaveAttribute('data-size', 'md');
    expect(group).toHaveAttribute('data-status', 'neutral');

    expect(slots()).toHaveLength(6);
    for (const slot of slots()) {
      expect(slot).toHaveClass('cl-otp-slot');
      expect(slot).toHaveAttribute('data-size', 'md');
    }
  });

  it.each(['sm', 'md', 'lg'] as const)('reflects the %s size on the group and every slot', size => {
    render(
      <Otp
        length={3}
        size={size}
        aria-label='Code'
      />,
    );
    expect(screen.getByRole('group', { name: 'Code' })).toHaveAttribute('data-size', size);
    for (const slot of slots()) {
      expect(slot).toHaveAttribute('data-size', size);
    }
  });

  it('marks every slot invalid when the status is error', () => {
    render(
      <Otp
        length={3}
        status='error'
        aria-label='Code'
      />,
    );
    expect(screen.getByRole('group', { name: 'Code' })).toHaveAttribute('data-status', 'error');
    for (const slot of slots()) {
      expect(slot).toHaveAttribute('data-status', 'error');
      expect(slot).toHaveAttribute('aria-invalid', 'true');
    }
  });

  it('reflects the success status without marking slots invalid', () => {
    render(
      <Otp
        length={3}
        status='success'
        aria-label='Code'
      />,
    );
    expect(screen.getByRole('group', { name: 'Code' })).toHaveAttribute('data-status', 'success');
    for (const slot of slots()) {
      expect(slot).toHaveAttribute('data-status', 'success');
      expect(slot).not.toHaveAttribute('aria-invalid');
    }
  });

  it('reflects and forwards the disabled state', () => {
    render(
      <Otp
        length={3}
        disabled
        aria-label='Code'
      />,
    );
    expect(screen.getByRole('group', { name: 'Code' })).toHaveAttribute('data-disabled', '');
    for (const slot of slots()) {
      expect(slot).toBeDisabled();
      expect(slot).toHaveAttribute('data-disabled', '');
    }
  });

  it('advances focus as characters are typed and reports completion', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <Otp
        length={3}
        onComplete={onComplete}
        aria-label='Code'
      />,
    );

    await user.click(slots()[0]);
    await user.keyboard('123');

    expect(slots().map(slot => (slot as HTMLInputElement).value)).toEqual(['1', '2', '3']);
    expect(onComplete).toHaveBeenCalledWith('123');
  });

  it('takes disabled and invalid from an enclosing Field', () => {
    render(
      <Field.Root
        disabled
        invalid
      >
        <Otp
          length={3}
          aria-label='Code'
        />
      </Field.Root>,
    );
    const group = screen.getByRole('group', { name: 'Code' });
    expect(group).toHaveAttribute('data-status', 'error');
    expect(group).toHaveAttribute('data-disabled', '');
    expect(slots()[0]).toBeDisabled();
  });

  it('associates the Field label and messages with the group', () => {
    render(
      <Field.Root>
        <Field.Label>Verification code</Field.Label>
        <Otp length={3} />
        <Field.Description>Check your email.</Field.Description>
      </Field.Root>,
    );
    const group = screen.getByRole('group', { name: 'Verification code' });
    expect(group).toHaveAccessibleDescription('Check your email.');
  });

  it('merges consumer className and inline styles onto the group', () => {
    render(
      <Otp
        length={3}
        className='my-otp'
        style={{ marginTop: '8px' }}
        aria-label='Code'
      />,
    );
    const group = screen.getByRole('group', { name: 'Code' });
    expect(group).toHaveClass('cl-otp', 'my-otp');
    expect(group).toHaveStyle({ marginTop: '8px' });
  });

  it('submits the combined value under the given name', () => {
    render(
      <Otp
        length={3}
        name='code'
        defaultValue='123'
        aria-label='Code'
      />,
    );
    expect(document.querySelector('input[name="code"]')).toHaveValue('123');
  });
});
