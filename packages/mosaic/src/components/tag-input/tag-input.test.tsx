import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Field } from '../field';
import { TagInput } from './tag-input';

const atoms = stylex.create({
  spaced: { marginTop: '8px' },
});

const rootOf = (element: HTMLElement) => {
  const root = element.closest('.cl-tag-input');
  if (!(root instanceof HTMLElement)) {
    throw new Error('TagInput root not found');
  }
  return root;
};

describe('Mosaic TagInput', () => {
  it('renders a tag per value with the slot classes', () => {
    render(
      <TagInput
        aria-label='Email'
        defaultValue={['preston@clerk.dev', 'nate@clerk.dev']}
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveClass('cl-tag-input-input');
    expect(rootOf(input)).not.toHaveAttribute('data-disabled');

    const tags = screen.getAllByRole('listitem');
    expect(tags).toHaveLength(2);
    expect(tags[0]).toHaveClass('cl-tag-input-tag');
    expect(tags[0]).toHaveTextContent('preston@clerk.dev');
    expect(screen.getByRole('button', { name: 'Remove nate@clerk.dev' })).toHaveClass('cl-tag-input-tag-remove');
  });

  it('adds a tag on Enter and reports the new value', async () => {
    const onValueChange = vi.fn();
    render(
      <TagInput
        aria-label='Email'
        onValueChange={onValueChange}
      />,
    );

    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'preston@clerk.dev{Enter}');

    expect(onValueChange).toHaveBeenLastCalledWith(['preston@clerk.dev']);
    expect(screen.getByRole('listitem')).toHaveTextContent('preston@clerk.dev');
  });

  it('removes a tag from its remove button', async () => {
    const onValueChange = vi.fn();
    render(
      <TagInput
        aria-label='Email'
        defaultValue={['preston@clerk.dev', 'nate@clerk.dev']}
        onValueChange={onValueChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Remove preston@clerk.dev' }));

    expect(onValueChange).toHaveBeenLastCalledWith(['nate@clerk.dev']);
  });

  it('labels each remove button with removeLabel', () => {
    render(
      <TagInput
        aria-label='Email'
        defaultValue={['preston@clerk.dev']}
        removeLabel={value => `Quitar ${value}`}
      />,
    );

    expect(screen.getByRole('button', { name: 'Quitar preston@clerk.dev' })).toBeInTheDocument();
  });

  it('marks tags that fail validation', () => {
    render(
      <TagInput
        aria-label='Email'
        defaultValue={['preston@clerk.dev', 'nate']}
        validate={value => value.includes('@')}
      />,
    );

    const [valid, invalid] = screen.getAllByRole('listitem');
    expect(valid).not.toHaveAttribute('data-invalid');
    expect(invalid).toHaveAttribute('data-invalid', '');
  });

  it('disables the input, tags and remove buttons', () => {
    render(
      <TagInput
        aria-label='Email'
        defaultValue={['preston@clerk.dev']}
        disabled
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toBeDisabled();
    expect(rootOf(input)).toHaveAttribute('data-disabled', '');
    expect(screen.getByRole('listitem')).toHaveAttribute('data-disabled', '');
    expect(screen.getByRole('button', { name: 'Remove preston@clerk.dev' })).toBeDisabled();
  });

  it('reflects aria-invalid on the input and the root', () => {
    render(
      <TagInput
        aria-label='Email'
        aria-invalid
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(rootOf(input)).toHaveAttribute('data-invalid', '');
  });

  it('stops requiring typed text once a tag exists', async () => {
    render(
      <TagInput
        aria-label='Email'
        required
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('required');

    await userEvent.type(input, 'preston@clerk.dev{Enter}');

    expect(input).not.toHaveAttribute('required');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('submits each value under the given name', () => {
    const { container } = render(
      <TagInput
        aria-label='Email'
        name='emails'
        defaultValue={['preston@clerk.dev', 'nate@clerk.dev']}
      />,
    );

    const hidden = container.querySelectorAll('input[type="hidden"][name="emails"]');
    expect(Array.from(hidden, input => input.getAttribute('value'))).toEqual(['preston@clerk.dev', 'nate@clerk.dev']);
    expect(screen.getByRole('textbox', { name: 'Email' })).not.toHaveAttribute('name');
  });

  it('forwards the ref and native input props to the text input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <TagInput
        ref={ref}
        aria-label='Email'
        placeholder='Add an email'
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('placeholder', 'Add an email');
  });

  it('merges xstyle atoms onto the root', () => {
    render(
      <TagInput
        aria-label='Email'
        xstyle={atoms.spaced}
      />,
    );

    expect(rootOf(screen.getByRole('textbox', { name: 'Email' }))).toHaveClass(
      'cl-tag-input',
      stylex.props(atoms.spaced).className ?? '',
    );
  });

  describe('inside a Field', () => {
    it('is labelled and described by the field', () => {
      render(
        <Field.Root>
          <Field.Label>Email</Field.Label>
          <TagInput />
          <Field.Description>Press enter, comma, or paste to add</Field.Description>
        </Field.Root>,
      );

      expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAccessibleDescription(
        'Press enter, comma, or paste to add',
      );
    });

    it('focuses the text input when the label is clicked', async () => {
      render(
        <Field.Root>
          <Field.Label>Email</Field.Label>
          <TagInput />
        </Field.Root>,
      );

      await userEvent.click(screen.getByText('Email'));

      expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus();
    });

    it('takes disabled, required and invalid from the field', () => {
      render(
        <Field.Root
          disabled
          required
          invalid
        >
          <Field.Label>Email</Field.Label>
          <TagInput defaultValue={['preston@clerk.dev']} />
        </Field.Root>,
      );

      const input = screen.getByRole('textbox', { name: 'Email' });
      expect(input).toBeDisabled();
      expect(input).toBeRequired();
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(rootOf(input)).toHaveAttribute('data-disabled', '');
      expect(rootOf(input)).toHaveAttribute('data-invalid', '');
      expect(screen.getByRole('button', { name: 'Remove preston@clerk.dev' })).toBeDisabled();
    });
  });
});
