import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '../field';
import { Icon } from '../icon';
import { InputGroup } from '../input-group';
import { scrollAreaRoot, scrollAreaViewport } from '../scroll-area';
import { Combobox } from './combobox';

const scrollClasses = stylex.props(...scrollAreaViewport()).className?.split(' ') ?? [];
const rootClasses = stylex.props(scrollAreaRoot).className?.split(' ') ?? [];
const viewportOnlyClasses = scrollClasses.filter(name => !rootClasses.includes(name));

function FloatingCombobox(props?: { onValueChange?: (value: string) => void }) {
  return (
    <Combobox.Root onValueChange={props?.onValueChange}>
      <InputGroup.Root>
        <Combobox.Input
          variant='headless'
          aria-label='Fruit'
          placeholder='Search fruit'
        />
        <Combobox.Trigger
          aria-label='Toggle fruit options'
          render={
            <InputGroup.Action
              size='xs'
              shape='square'
            />
          }
        >
          <Icon
            name='chevron-down'
            size='sm'
            aria-hidden='true'
          />
        </Combobox.Trigger>
      </InputGroup.Root>
      <Combobox.Popup>
        <Combobox.Option
          value='apple'
          label='Apple'
        >
          Apple
        </Combobox.Option>
        <Combobox.Option
          value='banana'
          label='Banana'
        >
          Banana
        </Combobox.Option>
      </Combobox.Popup>
    </Combobox.Root>
  );
}

describe('Mosaic Combobox', () => {
  it('opens its options from a composed trigger', async () => {
    const user = userEvent.setup();
    render(<FloatingCombobox />);

    const input = screen.getByRole('combobox', { name: 'Fruit' });
    const trigger = screen.getByRole('button', { name: 'Toggle fruit options' });
    expect(trigger).toHaveClass('cl-button', 'cl-input-group-action', 'cl-combobox-trigger');
    expect(trigger).toHaveAttribute('data-size', 'xs');
    expect(trigger).toHaveAttribute('data-variant', 'ghost');
    expect(trigger).toHaveAttribute('data-color', 'neutral');

    await user.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-open', '');
    expect(input).toHaveFocus();
  });

  it('renders a field-aware, sized input', () => {
    render(
      <Field.Root
        required
        invalid
      >
        <Field.Label>Fruit</Field.Label>
        <Combobox.Root>
          <Combobox.Input size='lg' />
          <Combobox.Popup>
            <Combobox.Option value='apple'>Apple</Combobox.Option>
          </Combobox.Popup>
        </Combobox.Root>
        <Field.Error>Choose a fruit</Field.Error>
      </Field.Root>,
    );

    const input = screen.getByRole('combobox', { name: 'Fruit' });
    expect(input).toHaveClass('cl-input', 'cl-combobox-input');
    expect(input).toHaveAttribute('data-size', 'lg');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Choose a fruit');
  });

  it('opens a styled floating popup when the user types', async () => {
    const user = userEvent.setup();
    render(<FloatingCombobox />);

    await user.type(screen.getByRole('combobox', { name: 'Fruit' }), 'a');

    const listbox = screen.getByRole('listbox');
    const popup = listbox.querySelector('.cl-combobox-popup');
    const viewport = popup?.querySelector('.cl-combobox-viewport');
    expect(listbox).toHaveClass('cl-combobox-positioner');
    expect(popup).toBeInTheDocument();
    expect(viewport).toHaveClass(...scrollClasses);
    expect(viewportOnlyClasses).not.toHaveLength(0);
    expect(viewportOnlyClasses.filter(name => popup?.classList.contains(name))).toEqual([]);
    expect(screen.getByRole('option', { name: 'Apple' }).closest('.cl-combobox-viewport')).toBe(viewport);
  });

  it('selects an option and restores its label to the input', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<FloatingCombobox onValueChange={onValueChange} />);

    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.type(input, 'b');
    await user.click(screen.getByRole('option', { name: 'Banana' }));

    expect(onValueChange).toHaveBeenCalledWith('banana');
    expect(input).toHaveValue('Banana');
    expect(input).toHaveFocus();
  });

  it('supports keyboard selection', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<FloatingCombobox onValueChange={onValueChange} />);

    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.type(input, 'a');
    await user.keyboard('{Enter}');

    expect(onValueChange).toHaveBeenCalledWith('apple');
  });

  it('styles disabled options and prevents their selection', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Combobox.Root
        open
        onValueChange={onValueChange}
      >
        <Combobox.Input aria-label='Fruit' />
        <Combobox.Popup>
          <Combobox.Option
            value='apple'
            disabled
          >
            Apple
          </Combobox.Option>
        </Combobox.Popup>
      </Combobox.Root>,
    );

    const option = screen.getByRole('option', { name: 'Apple' });
    expect(option).toHaveClass('cl-combobox-option');
    expect(option).toHaveAttribute('aria-disabled', 'true');
    await user.click(option);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('uses the headless Input variant inside an input group', () => {
    render(
      <Combobox.Root open>
        <InputGroup.Root size='lg'>
          <InputGroup.Text>
            <Icon
              name='search'
              aria-hidden='true'
            />
          </InputGroup.Text>
          <Combobox.Input
            variant='headless'
            aria-label='Search countries'
            placeholder='Search country or code'
          />
        </InputGroup.Root>
        <Combobox.List>
          <Combobox.Option value='us'>United States</Combobox.Option>
        </Combobox.List>
      </Combobox.Root>,
    );

    expect(screen.getByRole('combobox', { name: 'Search countries' })).toHaveClass('cl-input', 'cl-combobox-input');
    expect(screen.getByRole('combobox', { name: 'Search countries' })).toHaveAttribute('data-size', 'lg');
    expect(screen.getByRole('combobox', { name: 'Search countries' })).toHaveAttribute('data-variant', 'headless');
    expect(screen.getByRole('listbox')).toHaveClass('cl-combobox-list', ...scrollClasses);
    expect(screen.getByRole('option', { name: 'United States' })).toHaveClass('cl-combobox-option');
  });

  it('renders a reusable empty state', () => {
    render(<Combobox.Empty>No matches</Combobox.Empty>);

    expect(screen.getByText('No matches')).toHaveClass('cl-combobox-empty');
  });
});
