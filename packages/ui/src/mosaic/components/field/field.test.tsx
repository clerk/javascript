import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Input } from '../input';
import { Field } from './field';

describe('Mosaic Field', () => {
  it('supports explicit native label and message relationships', () => {
    render(
      <Field.Root>
        <Field.Label
          id='email-label'
          htmlFor='email'
        >
          Email
        </Field.Label>
        <Input
          id='email'
          aria-labelledby='email-label'
          aria-describedby='email-description email-error'
          aria-invalid='true'
        />
        <Field.Description id='email-description'>Used for account notifications.</Field.Description>
        <Field.Error id='email-error'>Enter a valid email.</Field.Error>
      </Field.Root>,
    );

    const control = screen.getByRole('textbox', { name: 'Email' });
    expect(screen.getByText('Email')).toHaveAttribute('id', 'email-label');
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email');
    expect(control).toHaveAttribute('id', 'email');
    expect(control).toHaveAttribute('aria-labelledby', 'email-label');
    expect(control).toHaveAttribute('aria-describedby', 'email-description email-error');
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Used for account notifications.')).toHaveAttribute('id', 'email-description');
    expect(screen.getByText('Enter a valid email.').closest('p')).toHaveAttribute('id', 'email-error');
  });

  it('preserves caller-provided IDs and ARIA attributes unchanged', () => {
    render(
      <Field.Root aria-label='Account details'>
        <Field.Label
          id='custom-label'
          htmlFor='custom-control'
          aria-hidden='false'
        >
          Account
        </Field.Label>
        <Field.Description
          id='custom-description'
          aria-live='polite'
        >
          Description
        </Field.Description>
        <Field.Error
          id='custom-error'
          role='alert'
        >
          Error
        </Field.Error>
      </Field.Root>,
    );

    expect(screen.getByLabelText('Account details')).toHaveClass('cl-field-root');
    expect(screen.getByText('Account')).toHaveAttribute('id', 'custom-label');
    expect(screen.getByText('Account')).toHaveAttribute('for', 'custom-control');
    expect(screen.getByText('Account')).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByText('Description')).toHaveAttribute('id', 'custom-description');
    expect(screen.getByText('Description')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'custom-error');
  });

  it('allows every part to render independently of Root', () => {
    render(
      <>
        <Field.Label htmlFor='standalone'>Standalone label</Field.Label>
        <Field.Description id='standalone-description'>Standalone description</Field.Description>
        <Field.Error id='standalone-error'>Standalone error</Field.Error>
      </>,
    );

    expect(screen.getByText('Standalone label')).toHaveClass('cl-field-label');
    expect(screen.getByText('Standalone description')).toHaveClass('cl-field-description');
    expect(screen.getByText('Standalone error').closest('p')).toHaveClass('cl-field-error');
  });

  it('keeps Input native and ARIA behavior identical inside and outside Field', () => {
    const props = {
      id: 'account-email',
      name: 'email',
      type: 'email',
      required: true,
      readOnly: true,
      'aria-label': 'Account email',
      'aria-labelledby': 'external-label',
      'aria-describedby': 'external-description external-error',
      'aria-invalid': 'grammar' as const,
      'aria-disabled': 'false' as const,
      'aria-required': 'true' as const,
    };

    render(
      <>
        <Input
          {...props}
          data-testid='outside'
        />
        <Field.Root>
          <Input
            {...props}
            data-testid='inside'
          />
        </Field.Root>
      </>,
    );

    const outside = screen.getByTestId('outside');
    const inside = screen.getByTestId('inside');
    const attributes = [
      'id',
      'name',
      'type',
      'required',
      'readonly',
      'aria-label',
      'aria-labelledby',
      'aria-describedby',
      'aria-invalid',
      'aria-disabled',
      'aria-required',
      'class',
      'data-size',
    ];
    for (const attribute of attributes) {
      expect(inside.getAttribute(attribute)).toBe(outside.getAttribute(attribute));
    }
    expect(inside).toHaveClass('cl-input');
    expect(inside).not.toHaveClass('cl-field-control');
  });

  it('forwards refs and native props from every part', () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const labelRef = React.createRef<HTMLLabelElement>();
    const descriptionRef = React.createRef<HTMLParagraphElement>();
    const errorRef = React.createRef<HTMLParagraphElement>();

    render(
      <Field.Root
        ref={rootRef}
        data-root='field'
      >
        <Field.Label
          ref={labelRef}
          htmlFor='name'
        >
          Name
        </Field.Label>
        <Field.Description
          ref={descriptionRef}
          title='Help'
        >
          Description
        </Field.Description>
        <Field.Error
          ref={errorRef}
          role='status'
        >
          Error
        </Field.Error>
      </Field.Root>,
    );

    expect(rootRef.current).toHaveAttribute('data-root', 'field');
    expect(labelRef.current).toHaveAttribute('for', 'name');
    expect(descriptionRef.current).toHaveAttribute('title', 'Help');
    expect(errorRef.current).toHaveAttribute('role', 'status');
  });

  it('lets caller styling win without prescribing layout', () => {
    render(
      <Field.Root
        className='root'
        style={{ display: 'grid' }}
        data-testid='root'
      >
        <Field.Label
          className='label'
          style={{ fontWeight: 700 }}
        >
          Email
        </Field.Label>
        <Field.Description
          className='description'
          style={{ opacity: 0.8 }}
        >
          Description
        </Field.Description>
        <Field.Error
          className='error'
          style={{ fontWeight: 600 }}
        >
          Error
        </Field.Error>
      </Field.Root>,
    );

    expect(screen.getByTestId('root')).toHaveClass('cl-field-root', 'root');
    expect(screen.getByTestId('root')).toHaveStyle({ display: 'grid' });
    expect(screen.getByText('Email')).toHaveClass('cl-field-label', 'label');
    expect(screen.getByText('Email')).toHaveStyle({ fontWeight: 700 });
    expect(screen.getByText('Description')).toHaveClass('cl-field-description', 'description');
    expect(screen.getByText('Description')).toHaveStyle({ opacity: 0.8 });
    expect(screen.getByText('Error').closest('p')).toHaveClass('cl-field-error', 'error');
    expect(screen.getByText('Error').closest('p')).toHaveStyle({ fontWeight: 600 });
  });

  it('supports render escape hatches on every part', () => {
    render(
      <Field.Root render={props => <section {...props} />}>
        <Field.Label render={props => <label {...props} />}>Biography</Field.Label>
        <Field.Description render={props => <div {...props} />}>Description</Field.Description>
        <Field.Error render={props => <div {...props} />}>Error</Field.Error>
      </Field.Root>,
    );

    expect(screen.getByText('Biography').closest('section')).not.toBeNull();
    expect(screen.getByText('Description').tagName).toBe('DIV');
    expect(screen.getByText('Error').closest('div')).toHaveClass('cl-field-error');
  });

  it('preserves the opt-in error presentation and icon', () => {
    render(<Field.Error>Email is invalid.</Field.Error>);

    const error = screen.getByText('Email is invalid.').closest('p');
    expect(error).not.toHaveAttribute('role');
    expect(error).not.toHaveAttribute('aria-live');
    expect(error?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('warns when Field.Label does not render a native label', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    render(<Field.Label render={<div />}>Email</Field.Label>);

    expect(consoleWarn).toHaveBeenCalledWith('[clerk] <Field.Label> must render a native `<label>` element.');
    consoleWarn.mockRestore();
  });
});
