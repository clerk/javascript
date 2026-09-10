import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '../field';
import { Select } from './select';

const roles = [
  { value: 'all', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
];

function renderSelect(props?: Partial<React.ComponentProps<typeof Select.Root>>) {
  return render(
    <Select.Root
      items={roles}
      defaultValue='all'
      {...props}
    >
      <Select.Trigger placeholder='Choose a role' />
      <Select.Popup />
    </Select.Root>,
  );
}

describe('Mosaic Select', () => {
  it('renders an outline neutral md Button as the default trigger, showing the selected label', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('cl-button', 'cl-select-trigger');
    expect(trigger).toHaveAttribute('data-variant', 'outline');
    expect(trigger).toHaveAttribute('data-color', 'neutral');
    expect(trigger).toHaveAttribute('data-size', 'md');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger.querySelector('.cl-select-value')).toHaveTextContent('All roles');
    expect(trigger.querySelector('.cl-select-trigger-icon')).toBeInTheDocument();
  });

  it('shows the placeholder until a value is selected', () => {
    renderSelect({ defaultValue: undefined });
    expect(screen.getByRole('combobox').querySelector('.cl-select-value')).toHaveTextContent('Choose a role');
  });

  it('renders the ghost variant without a border', () => {
    render(
      <Select.Root
        items={[{ value: 'member', label: 'Member' }]}
        defaultValue='member'
      >
        <Select.Trigger variant='ghost' />
        <Select.Popup>
          <Select.Option
            value='member'
            label='Member'
          />
        </Select.Popup>
      </Select.Root>,
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('data-variant', 'ghost');
    expect(trigger).toHaveClass('cl-select-trigger');
  });

  it('renders a consumer trigger passed via render', () => {
    render(
      <Select.Root
        items={[{ value: 'all', label: 'All roles' }]}
        defaultValue='all'
      >
        <Select.Trigger
          render={props => (
            <button
              type='button'
              {...props}
            />
          )}
        />
        <Select.Popup>
          <Select.Option
            value='all'
            label='All roles'
          />
        </Select.Popup>
      </Select.Root>,
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('cl-select-trigger');
    expect(trigger).not.toHaveClass('cl-button');
    expect(trigger.querySelector('.cl-select-value')).toHaveTextContent('All roles');
  });

  it('keeps the listbox closed until the trigger is clicked', async () => {
    const user = userEvent.setup();
    renderSelect();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('combobox'));

    // `role="listbox"` sits on the positioner (floating-ui owns it); the popup is the surface inside.
    expect(screen.getByRole('listbox')).toHaveClass('cl-select-positioner');
    const popup = screen.getByRole('listbox').querySelector('.cl-select-popup');
    expect(popup).toBeInTheDocument();
    expect(popup?.querySelector('.cl-select-viewport')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('marks the selected option and reserves the check on every row', async () => {
    const user = userEvent.setup();
    renderSelect();

    await user.click(screen.getByRole('combobox'));

    const selected = screen.getByRole('option', { name: 'All roles' });
    expect(selected).toHaveAttribute('aria-selected', 'true');
    expect(selected).toHaveAttribute('data-selected', '');
    expect(selected.querySelector('.cl-select-option-indicator')).toBeInTheDocument();

    const other = screen.getByRole('option', { name: 'Admin' });
    expect(other).not.toHaveAttribute('data-selected');
    expect(other.querySelector('.cl-select-option-indicator')).toBeInTheDocument();
  });

  it('selects an option on click, closes, and updates the trigger', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderSelect({ onValueChange });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Admin' }));

    expect(onValueChange).toHaveBeenCalledWith('admin');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox').querySelector('.cl-select-value')).toHaveTextContent('Admin');
  });

  it('renders one option per item when the popup is given no children', () => {
    render(
      <Select.Root
        items={[
          { value: 'member', label: 'Member', description: 'Non-privileged' },
          { value: 'admin', label: 'Admin', disabled: true },
        ]}
        defaultOpen
      >
        <Select.Trigger />
        <Select.Popup />
      </Select.Root>,
    );

    const member = screen.getByRole('option', { name: 'Member' });
    expect(member).toHaveAttribute('data-described', '');
    expect(member).toHaveAccessibleDescription('Non-privileged');
    expect(screen.getByRole('option', { name: 'Admin' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders the label and description as separate slots, with the description off the name', () => {
    render(
      <Select.Root
        items={[{ value: 'admin', label: 'Admin' }]}
        defaultOpen
      >
        <Select.Trigger />
        <Select.Popup>
          <Select.Option
            value='admin'
            label='Admin'
            description='Can manage members and settings'
          />
        </Select.Popup>
      </Select.Root>,
    );

    const option = screen.getByRole('option', { name: 'Admin' });
    expect(option).toHaveAttribute('data-described', '');
    expect(option.querySelector('.cl-select-option-label')).toHaveTextContent('Admin');
    expect(option.querySelector('.cl-select-option-description')).toHaveTextContent('Can manage members and settings');
  });

  it('marks a disabled option as aria-disabled and does not select it', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select.Root
        items={[{ value: 'admin', label: 'Admin' }]}
        defaultOpen
        onValueChange={onValueChange}
      >
        <Select.Trigger />
        <Select.Popup>
          <Select.Option
            value='admin'
            label='Admin'
            disabled
          />
        </Select.Popup>
      </Select.Root>,
    );

    const option = screen.getByRole('option', { name: 'Admin' });
    expect(option).toHaveAttribute('aria-disabled', 'true');

    await user.click(option);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('merges consumer className and style onto the popup and options', () => {
    render(
      <Select.Root
        items={[{ value: 'admin', label: 'Admin' }]}
        defaultOpen
      >
        <Select.Trigger />
        <Select.Popup
          className='my-popup'
          style={{ marginTop: '8px' }}
        >
          <Select.Option
            value='admin'
            label='Admin'
            className='my-option'
          />
        </Select.Popup>
      </Select.Root>,
    );

    const popup = screen.getByRole('listbox').querySelector('.cl-select-popup');
    expect(popup).toHaveClass('cl-select-popup', 'my-popup');
    expect(popup).toHaveStyle({ marginTop: '8px' });
    expect(screen.getByRole('option', { name: 'Admin' })).toHaveClass('cl-select-option', 'my-option');
  });

  it('forwards the trigger ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <Select.Root items={[{ value: 'admin', label: 'Admin' }]}>
        <Select.Trigger ref={ref} />
        <Select.Popup>
          <Select.Option
            value='admin'
            label='Admin'
          />
        </Select.Popup>
      </Select.Root>,
    );
    expect(ref.current).toBe(screen.getByRole('combobox'));
  });

  it('connects the trigger to a surrounding Field', async () => {
    const user = userEvent.setup();
    render(
      <Field.Root
        required
        invalid
      >
        <Field.Label>Role</Field.Label>
        <Select.Root
          items={roles}
          defaultValue='admin'
        >
          <Select.Trigger />
          <Select.Popup />
        </Select.Root>
        <Field.Description>Who can manage members.</Field.Description>
        <Field.Error>Pick a role.</Field.Error>
      </Field.Root>,
    );

    const trigger = screen.getByRole('combobox');
    const label = screen.getByText('Role');
    const value = trigger.querySelector('.cl-select-value');
    const description = screen.getByText('Who can manage members.');
    const error = screen.getByText('Pick a role.').closest('p');
    expect(value?.id).not.toBe('');
    expect(trigger).toHaveAttribute('aria-labelledby', `${label.id} ${value?.id}`);
    expect(trigger).toHaveAttribute('aria-describedby', `${description.id} ${error?.id}`);
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('aria-required', 'true');
    expect(trigger).not.toHaveAttribute('required');
    expect(trigger).toHaveAccessibleName('Role Admin');

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Member' }));
    expect(trigger).toHaveAccessibleName('Role Member');
  });

  it('disables the trigger from a disabled Field', () => {
    render(
      <Field.Root disabled>
        <Field.Label>Role</Field.Label>
        <Select.Root
          items={roles}
          defaultValue='admin'
        >
          <Select.Trigger />
          <Select.Popup />
        </Select.Root>
      </Field.Root>,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('names the trigger by its value outside a Field', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox');
    const value = trigger.querySelector('.cl-select-value');
    expect(trigger).toHaveAttribute('aria-labelledby', value?.id);
    expect(trigger).toHaveAccessibleName('All roles');
  });

  it('keeps a consumer aria-label ahead of the value', () => {
    render(
      <Select.Root
        items={roles}
        defaultValue='all'
      >
        <Select.Trigger aria-label='Filter by role' />
        <Select.Popup />
      </Select.Root>,
    );
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Filter by role All roles');
  });
});
