import * as stylex from '@stylexjs/stylex';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { colorVars } from '../../tokens.stylex';
import { Button } from '../button';
import { Field } from '../field';
import { Input } from '../input';
import { InputGroup } from './input-group';

const expectedTextStyles = stylex.create({
  text: { color: colorVars['--cl-color-input-placeholder'], pointerEvents: 'none' },
});

describe('Mosaic InputGroup', () => {
  it('focuses the input when clicking the group or non-interactive slot content', () => {
    render(
      <InputGroup.Root data-testid='group'>
        <Input aria-label='Value' />
        <InputGroup.End>
          <span>Decoration</span>
        </InputGroup.End>
      </InputGroup.Root>,
    );
    const input = screen.getByRole('textbox');
    fireEvent.click(screen.getByTestId('group'));
    expect(input).toHaveFocus();
    input.blur();
    fireEvent.click(screen.getByText('Decoration'));
    expect(input).toHaveFocus();
  });

  it('does not focus the input when the group click is canceled or disabled', () => {
    const { rerender } = render(
      <InputGroup.Root
        data-testid='group'
        onClick={event => event.preventDefault()}
      >
        <Input aria-label='Value' />
      </InputGroup.Root>,
    );
    fireEvent.click(screen.getByTestId('group'));
    expect(screen.getByRole('textbox')).not.toHaveFocus();
    rerender(
      <InputGroup.Root
        data-testid='group'
        disabled
      >
        <Input aria-label='Value' />
      </InputGroup.Root>,
    );
    fireEvent.click(screen.getByTestId('group'));
    expect(screen.getByRole('textbox')).not.toHaveFocus();
  });

  it('preserves interactive child clicks and direct input clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <InputGroup.Root>
        <Input aria-label='Value' />
        <InputGroup.End>
          <Button onClick={onClick}>
            <span>Action</span>
          </Button>
          <a href='#value'>Link</a>
          <span
            role='button'
            tabIndex={0}
          >
            Custom control
          </span>
        </InputGroup.End>
      </InputGroup.Root>,
    );
    for (const name of ['Action', 'Link', 'Custom control']) {
      await user.click(screen.getByText(name));
      expect(screen.getByRole('textbox')).not.toHaveFocus();
    }
    expect(onClick).toHaveBeenCalledTimes(1);
    const input = screen.getByRole('textbox');
    const focus = vi.spyOn(input, 'focus');
    fireEvent.click(input);
    expect(focus).not.toHaveBeenCalled();
    focus.mockRestore();
  });

  it('uses placeholder-colored, pointer-transparent text', () => {
    render(
      <InputGroup.Root>
        <InputGroup.Text>Suffix</InputGroup.Text>
      </InputGroup.Root>,
    );
    const classes = stylex.props(expectedTextStyles.text).className ?? '';
    expect(screen.getByText('Suffix')).toHaveClass(...classes.split(' ').filter(name => name.startsWith('x')));
  });
  it.each([
    ['sm', 'xs'],
    ['md', 'sm'],
    ['lg', 'md'],
  ] as const)('uses a %s group with a %s slot button', (size, buttonSize) => {
    render(
      <InputGroup.Root size={size}>
        <InputGroup.Start>
          <Button>Start</Button>
        </InputGroup.Start>
        <Input aria-label='Value' />
        <InputGroup.End>
          <Button>End</Button>
        </InputGroup.End>
      </InputGroup.Root>,
    );
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('data-size', buttonSize);
    }
  });

  it.each(['Start', 'End'] as const)('provides button defaults inside %s', side => {
    const Slot = InputGroup[side];
    render(
      <InputGroup.Root disabled>
        <Input aria-label='Value' />
        <Slot>
          <Button aria-label='Action' />
        </Slot>
      </InputGroup.Root>,
    );
    const button = screen.getByRole('button', { name: 'Action' });
    expect(button).toHaveAttribute('data-size', 'sm');
    expect(button).toHaveAttribute('data-shape', 'square');
    expect(button).toHaveAttribute('data-variant', 'ghost');
    expect(button).toHaveAttribute('data-color', 'neutral');
    expect(button).toBeDisabled();
  });

  it('allows explicit button defaults to be overridden without affecting buttons outside the slot', () => {
    render(
      <>
        <InputGroup.Root>
          <InputGroup.End>
            <Button
              size='xs'
              shape='circle'
              variant='outline'
              color='primary'
            >
              Inside
            </Button>
          </InputGroup.End>
        </InputGroup.Root>
        <Button>Outside</Button>
      </>,
    );
    const inside = screen.getByRole('button', { name: 'Inside' });
    expect(inside).toHaveAttribute('data-size', 'xs');
    expect(inside).toHaveAttribute('data-shape', 'circle');
    expect(inside).toHaveAttribute('data-variant', 'outline');
    expect(inside).toHaveAttribute('data-color', 'primary');
    expect(screen.getByRole('button', { name: 'Outside' })).toHaveAttribute('data-size', 'md');
    expect(screen.getByRole('button', { name: 'Outside' })).toHaveAttribute('data-shape', 'default');
  });
  it('composes text and a ghost input inside one control', () => {
    render(
      <InputGroup.Root>
        <InputGroup.Text>https://</InputGroup.Text>
        <Input aria-label='Domain' />
        <InputGroup.Text>.com</InputGroup.Text>
      </InputGroup.Root>,
    );

    const group = document.querySelector('.cl-input-group');
    const input = screen.getByRole('textbox', { name: 'Domain' });
    expect(group).toHaveAttribute('data-size', 'md');
    expect(input).toHaveClass('cl-input');
    expect(input).toHaveAttribute('data-variant', 'ghost');
    expect(screen.getByText('https://')).toHaveClass('cl-input-group-text');
    expect(screen.getByText('.com')).toHaveClass('cl-input-group-text');
  });

  it('preserves an explicitly supplied input variant', () => {
    render(
      <InputGroup.Root>
        <Input
          variant='default'
          aria-label='Value'
        />
      </InputGroup.Root>,
    );

    expect(screen.getByRole('textbox', { name: 'Value' })).toHaveAttribute('data-variant', 'default');
  });

  it.each(['sm', 'md', 'lg'] as const)('shares the %s size with its parts', size => {
    render(
      <InputGroup.Root size={size}>
        <InputGroup.Text>Prefix</InputGroup.Text>
        <Input aria-label='Value' />
      </InputGroup.Root>,
    );

    expect(document.querySelector('.cl-input-group')).toHaveAttribute('data-size', size);
    expect(screen.getByRole('textbox', { name: 'Value' })).toHaveAttribute('data-size', size);
    expect(screen.getByText('Prefix')).toHaveAttribute('data-size', size);
  });

  it.each(['sm', 'md', 'lg'] as const)('shares the %s size and disabled state with an action', size => {
    render(
      <InputGroup.Root
        size={size}
        disabled
      >
        <Input aria-label='Value' />
        <InputGroup.Action aria-label='Show options' />
      </InputGroup.Root>,
    );

    const action = screen.getByRole('button', { name: 'Show options' });
    expect(action).toHaveClass('cl-button', 'cl-input-group-action');
    expect(action).toHaveAttribute('data-size', size);
    expect(action).toHaveAttribute('data-variant', 'ghost');
    expect(action).toHaveAttribute('data-color', 'neutral');
    expect(action).toBeDisabled();
  });

  it('allows an action to use a more compact button size', () => {
    render(
      <InputGroup.Root>
        <Input aria-label='Value' />
        <InputGroup.Action
          size='xs'
          shape='square'
          aria-label='Show options'
        />
      </InputGroup.Root>,
    );

    expect(screen.getByRole('button', { name: 'Show options' })).toHaveAttribute('data-size', 'xs');
  });

  it('inherits Field state and associates its label and messages with the input', () => {
    render(
      <Field.Root
        disabled
        required
        invalid
      >
        <Field.Label>Website</Field.Label>
        <InputGroup.Root>
          <InputGroup.Text>https://</InputGroup.Text>
          <Input />
        </InputGroup.Root>
        <Field.Error>Enter a valid website</Field.Error>
      </Field.Root>,
    );

    const group = document.querySelector('.cl-input-group');
    const input = screen.getByRole('textbox', { name: 'Website' });
    expect(group).toHaveAttribute('data-disabled', '');
    expect(group).toHaveAttribute('data-invalid', '');
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter a valid website');
  });

  it('lets text focus the grouped input without changing its value', async () => {
    const user = userEvent.setup();
    render(
      <InputGroup.Root>
        <Input aria-label='Email username' />
        <InputGroup.Text>@acme.com</InputGroup.Text>
      </InputGroup.Root>,
    );

    await user.click(screen.getByText('@acme.com'));

    expect(screen.getByRole('textbox', { name: 'Email username' })).toHaveFocus();
  });

  it('forwards native input props and the input ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <InputGroup.Root>
        <Input
          ref={ref}
          name='domain'
          placeholder='example'
        />
      </InputGroup.Root>,
    );

    const input = screen.getByPlaceholderText('example');
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('name', 'domain');
  });
});
