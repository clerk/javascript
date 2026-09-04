import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '../field';
import { Otp } from './otp';

const slots = () => screen.getAllByRole('textbox');

describe('Mosaic Otp', () => {
  it('renders one slot per character and applies the default status', () => {
    render(
      <Otp
        length={6}
        aria-label='Verification code'
      />,
    );

    const group = screen.getByRole('group', { name: 'Verification code' });
    expect(group).toHaveClass('cl-otp');
    expect(group).toHaveAttribute('data-status', 'neutral');

    expect(slots()).toHaveLength(6);
    for (const slot of slots()) {
      expect(slot).toHaveClass('cl-otp-slot');
    }
  });

  it('marks every slot invalid when aria-invalid is passed directly', () => {
    render(
      <Otp
        aria-invalid
        length={3}
        aria-label='Code'
      />,
    );

    expect(screen.getByRole('group', { name: 'Code' })).toHaveAttribute('data-status', 'error');
    for (const slot of slots()) {
      expect(slot).toHaveAttribute('aria-invalid', 'true');
    }
  });

  it('defaults to six slots', () => {
    render(<Otp aria-label='Verification code' />);

    expect(slots()).toHaveLength(6);
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

  it('points the Field label at the first slot so clicking it focuses the code', async () => {
    render(
      <Field.Root>
        <Field.Label>Verification code</Field.Label>
        <Otp length={3} />
      </Field.Root>,
    );

    const label = screen.getByText('Verification code');
    const first = slots()[0];
    expect(first.id).not.toBe('');
    expect(label).toHaveAttribute('for', first.id);
    expect(first).toHaveAccessibleName('Verification code');
    expect(slots()[1]).toHaveAccessibleName('Character 2 of 3');

    await userEvent.click(label);
    expect(first).toHaveFocus();
  });

  it('takes required from an enclosing Field and enforces it on every slot', () => {
    render(
      <Field.Root required>
        <Field.Label>Verification code</Field.Label>
        <Otp
          length={3}
          name='code'
        />
      </Field.Root>,
    );

    expect(slots().every(slot => (slot as HTMLInputElement).required)).toBe(true);
  });

  it('does not submit the value when an enclosing Field is disabled', () => {
    render(
      <Field.Root disabled>
        <Otp
          length={3}
          name='code'
          defaultValue='123'
          aria-label='Code'
        />
      </Field.Root>,
    );

    expect(document.querySelector('input[name="code"]')).toBeDisabled();
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
