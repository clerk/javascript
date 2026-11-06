import * as stylex from '@stylexjs/stylex';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '../field';
import { Radio } from './radio';

const atoms = stylex.create({
  spaced: { marginTop: '8px' },
});

describe('Mosaic Radio', () => {
  it('renders a native radio wrapped in the slot element', () => {
    render(<Radio.Item aria-label='All organizations' />);
    const input = screen.getByRole('radio', { name: 'All organizations' });
    expect(input).toHaveClass('cl-radio-input');
    expect(input.parentElement).toHaveClass('cl-radio');
  });

  it('checks one radio at a time within a name', async () => {
    const onChange = vi.fn();
    render(
      <>
        <Radio.Item
          aria-label='All'
          name='access'
          value='all'
          defaultChecked
        />
        <Radio.Item
          aria-label='Selected'
          name='access'
          value='selected'
          onChange={onChange}
        />
      </>,
    );

    await userEvent.click(screen.getByRole('radio', { name: 'Selected' }));

    expect(screen.getByRole('radio', { name: 'Selected' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'All' })).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('reflects the size axis on the slot element', () => {
    render(
      <Radio.Item
        aria-label='All'
        size='sm'
      />,
    );
    expect(screen.getByRole('radio').parentElement).toHaveAttribute('data-size', 'sm');
  });

  it('disables the input', () => {
    render(
      <Radio.Item
        aria-label='All'
        disabled
      />,
    );
    expect(screen.getByRole('radio')).toBeDisabled();
  });

  it('merges xstyle atoms onto the slot element', () => {
    render(
      <Radio.Item
        aria-label='All'
        xstyle={atoms.spaced}
      />,
    );
    expect(screen.getByRole('radio').parentElement).toHaveClass('cl-radio', stylex.props(atoms.spaced).className ?? '');
  });

  it('forwards the ref and arbitrary input props to the input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <Radio.Item
        ref={ref}
        aria-label='All'
        name='access'
        value='all'
      />,
    );
    const input = screen.getByRole('radio');
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('name', 'access');
    expect(input).toHaveAttribute('value', 'all');
  });

  it('takes its label, description and disabled state from a Field', async () => {
    render(
      <Field.Root orientation='horizontal'>
        <Radio.Item name='access' />
        <Field.Content>
          <Field.Label>All organizations</Field.Label>
          <Field.Description>Applies to every organization you belong to.</Field.Description>
        </Field.Content>
      </Field.Root>,
    );

    const radio = screen.getByRole('radio', { name: 'All organizations' });
    expect(radio).toHaveAttribute(
      'aria-describedby',
      screen.getByText('Applies to every organization you belong to.').id,
    );
    await userEvent.click(screen.getByText('All organizations'));
    expect(radio).toBeChecked();
  });

  it('disables the radio inside a disabled Field', () => {
    render(
      <Field.Root
        orientation='horizontal'
        disabled
      >
        <Radio.Item />
        <Field.Label>All organizations</Field.Label>
      </Field.Root>,
    );
    expect(screen.getByRole('radio', { name: 'All organizations' })).toBeDisabled();
  });

  describe('Group', () => {
    function Group(props: Partial<React.ComponentProps<typeof Radio.Group>>) {
      return (
        <Radio.Group
          aria-label='Organization access'
          {...props}
        >
          <Radio.Item
            aria-label='All'
            value='all'
          />
          <Radio.Item
            aria-label='Selected'
            value='selected'
          />
        </Radio.Group>
      );
    }

    it('renders a labelled radiogroup', () => {
      render(<Group />);
      expect(screen.getByRole('radiogroup', { name: 'Organization access' })).toHaveClass('cl-radio-group');
    });

    it('checks the item matching its value and reports the one the user picks', async () => {
      const onValueChange = vi.fn();
      render(
        <Group
          value='all'
          onValueChange={onValueChange}
        />,
      );
      expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();

      await userEvent.click(screen.getByRole('radio', { name: 'Selected' }));

      expect(onValueChange).toHaveBeenCalledWith('selected');
      expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
    });

    it('tracks the selection itself from a default value', async () => {
      render(<Group defaultValue='all' />);

      await userEvent.click(screen.getByRole('radio', { name: 'Selected' }));

      expect(screen.getByRole('radio', { name: 'Selected' })).toBeChecked();
      expect(screen.getByRole('radio', { name: 'All' })).not.toBeChecked();
    });

    it('gives every item the same name', () => {
      render(<Group />);
      const [all, selected] = screen.getAllByRole('radio');
      expect(all.getAttribute('name')).toBeTruthy();
      expect(selected).toHaveAttribute('name', all.getAttribute('name') ?? '');
    });

    it('posts the name it is given', () => {
      render(<Group name='access' />);
      expect(screen.getByRole('radio', { name: 'All' })).toHaveAttribute('name', 'access');
    });

    it('submits its value with a form when it has a name', () => {
      const { container } = render(
        <form>
          <Group
            name='access'
            defaultValue='all'
          />
        </form>,
      );
      expect(formEntries(container)).toEqual([['access', 'all']]);
    });

    it('submits nothing with a form when it has no name', () => {
      const { container } = render(
        <form>
          <Group defaultValue='all' />
        </form>,
      );
      expect(formEntries(container)).toEqual([]);
    });

    it('disables every item', () => {
      render(<Group disabled />);
      for (const radio of screen.getAllByRole('radio')) {
        expect(radio).toBeDisabled();
      }
    });

    it('labels each item with its own Field', () => {
      render(
        <Radio.Group aria-label='Organization access'>
          <Field.Root orientation='horizontal'>
            <Radio.Item value='all' />
            <Field.Label>All organizations</Field.Label>
          </Field.Root>
        </Radio.Group>,
      );
      expect(screen.getByRole('radio', { name: 'All organizations' })).toHaveAttribute('value', 'all');
    });

    it('reflects its layout for theming', () => {
      render(<Group layout='grid' />);
      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-layout', 'grid');
    });
  });

  describe('Card', () => {
    function Card({ value, label, description, disabled }: CardProps) {
      return (
        <Radio.Card
          value={value}
          disabled={disabled}
        >
          <Radio.Content>
            <Radio.Label>{label}</Radio.Label>
            {description ? <Radio.Description>{description}</Radio.Description> : null}
          </Radio.Content>
        </Radio.Card>
      );
    }

    function Picker(props: Partial<React.ComponentProps<typeof Radio.Group>> & { oktaDisabled?: boolean }) {
      const { oktaDisabled, ...groupProps } = props;
      return (
        <Radio.Group
          aria-label='Identity provider'
          {...groupProps}
        >
          <Card
            value='okta'
            label='Okta workforce'
            description='Sign in with Okta.'
            disabled={oktaDisabled}
          />
          <Card
            value='google'
            label='Google Workspace'
          />
        </Radio.Group>
      );
    }

    it('names the radio from its label and describes it with its description', () => {
      render(<Picker />);
      const radio = screen.getByRole('radio', { name: 'Okta workforce' });
      expect(radio).toHaveAccessibleDescription('Sign in with Okta.');
    });

    it('picks its value when the user clicks anywhere on the card', async () => {
      const onValueChange = vi.fn();
      render(<Picker onValueChange={onValueChange} />);

      await userEvent.click(screen.getByText('Sign in with Okta.'));

      expect(onValueChange).toHaveBeenCalledWith('okta');
      expect(screen.getByRole('radio', { name: 'Okta workforce' })).toBeChecked();
    });

    it('reflects whether it is checked for theming', async () => {
      render(<Picker defaultValue='google' />);
      const okta = screen.getByText('Okta workforce').closest('.cl-radio-card');
      const google = screen.getByText('Google Workspace').closest('.cl-radio-card');
      expect(okta).not.toHaveAttribute('data-checked');
      expect(google).toHaveAttribute('data-checked');

      await userEvent.click(screen.getByText('Okta workforce'));

      expect(okta).toHaveAttribute('data-checked');
      expect(google).not.toHaveAttribute('data-checked');
    });

    it('cannot be picked when it is disabled', async () => {
      const onValueChange = vi.fn();
      render(
        <Picker
          oktaDisabled
          onValueChange={onValueChange}
        />,
      );
      const radio = screen.getByRole('radio', { name: 'Okta workforce' });
      expect(radio).toBeDisabled();
      expect(screen.getByText('Okta workforce').closest('.cl-radio-card')).toHaveAttribute('data-disabled');

      await userEvent.click(screen.getByText('Okta workforce'));

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('cannot be picked when its group is disabled', () => {
      render(<Picker disabled />);
      for (const radio of screen.getAllByRole('radio')) {
        expect(radio).toBeDisabled();
      }
    });
  });

  describe('Section', () => {
    it('groups its radios under its label and shares the group name across sections', () => {
      render(
        <Radio.Group aria-label='Identity provider'>
          <Radio.Section label='SAML'>
            <Radio.Item
              aria-label='Okta workforce'
              value='okta'
            />
          </Radio.Section>
          <Radio.Section label='OpenID Connect (OIDC)'>
            <Radio.Item
              aria-label='OIDC Provider'
              value='oidc'
            />
          </Radio.Section>
        </Radio.Group>,
      );
      const saml = screen.getByRole('group', { name: 'SAML' });
      const oidc = screen.getByRole('group', { name: 'OpenID Connect (OIDC)' });
      const okta = within(saml).getByRole('radio', { name: 'Okta workforce' });
      const oidcRadio = within(oidc).getByRole('radio', { name: 'OIDC Provider' });
      expect(okta.getAttribute('name')).toBeTruthy();
      expect(oidcRadio).toHaveAttribute('name', okta.getAttribute('name') ?? '');
    });

    it('reflects its layout for theming', () => {
      render(
        <Radio.Group aria-label='Identity provider'>
          <Radio.Section
            label='SAML'
            layout='grid'
          >
            <Radio.Item
              aria-label='Okta workforce'
              value='okta'
            />
          </Radio.Section>
        </Radio.Group>,
      );
      expect(screen.getByRole('group', { name: 'SAML' })).toHaveAttribute('data-layout', 'grid');
    });
  });
});

interface CardProps {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

function formEntries(container: HTMLElement) {
  const form = container.querySelector('form');
  if (!form) {
    throw new Error('Expected a form');
  }
  return [...new FormData(form).entries()];
}
