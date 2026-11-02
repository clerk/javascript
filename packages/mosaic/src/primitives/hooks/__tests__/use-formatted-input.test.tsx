import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { useFormattedInput } from '../use-formatted-input';

function groupThousands(raw: string): string {
  return raw.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function fixedTwoDecimals(raw: string): string {
  const [integer = '', fraction = ''] = raw.replace(/[^\d.]/g, '').split('.');
  return `${Number(integer || '0')}.${fraction.padEnd(2, '0').slice(0, 2)}`;
}

function FormattedInput(props: { initial: string; format: (raw: string) => string; accept?: RegExp }) {
  const [value, setValue] = React.useState(props.initial);
  const input = useFormattedInput({
    value,
    onChange: setValue,
    format: props.format,
    accept: props.accept,
  });
  return (
    <input
      aria-label='Amount'
      {...input}
    />
  );
}

async function editAt(initial: string, caret: number, keys: string, format = groupThousands, accept?: RegExp) {
  const user = userEvent.setup();
  render(
    <FormattedInput
      initial={initial}
      format={format}
      accept={accept}
    />,
  );
  const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Amount' });
  await user.click(input);
  input.setSelectionRange(caret, caret);
  await user.keyboard(keys);
  return input;
}

describe('useFormattedInput', () => {
  afterEach(() => {
    cleanup();
  });

  it('keeps the caret after a character inserted where separators move', async () => {
    const input = await editAt('1,23467', 5, '5');

    expect(input).toHaveValue('1,234,567');
    expect(input.selectionStart).toBe(7);
  });

  it('keeps the caret at the end while typing at the end', async () => {
    const input = await editAt('123', 3, '4');

    expect(input).toHaveValue('1,234');
    expect(input.selectionStart).toBe(5);
  });

  it('steps back over a separator on backspace', async () => {
    const input = await editAt('1,234', 2, '{Backspace}');

    expect(input).toHaveValue('1,234');
    expect(input.selectionStart).toBe(1);
  });

  it('steps forward over a separator on delete', async () => {
    const input = await editAt('1,234', 1, '{Delete}');

    expect(input).toHaveValue('1,234');
    expect(input.selectionStart).toBe(2);
  });

  it('keeps the caret in place when the edit is rejected', async () => {
    const input = await editAt('1,234', 3, 'a');

    expect(input).toHaveValue('1,234');
    expect(input.selectionStart).toBe(3);
  });

  it('keeps the caret after the typed character when the formatter drops one before it', async () => {
    const input = await editAt('0.00', 1, '1', fixedTwoDecimals, /[\d.]/);

    expect(input).toHaveValue('1.00');
    expect(input.selectionStart).toBe(1);
  });

  it('accepts a global accept pattern', async () => {
    const input = await editAt('1,23467', 5, '5', groupThousands, /\d/g);

    expect(input).toHaveValue('1,234,567');
    expect(input.selectionStart).toBe(7);
  });
});
