import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { Input } from '../input';
import { Field } from './field';

describe('Mosaic Field', () => {
  it('associates generated label and description IDs with the control', () => {
    render(
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Input />
        <Field.Description>Used for account notifications.</Field.Description>
      </Field.Root>,
    );

    const control = screen.getByRole('textbox', { name: 'Email' });
    const label = screen.getByText('Email');
    const description = screen.getByText('Used for account notifications.');

    expect(control.id).not.toBe('');
    expect(label).toHaveAttribute('for', control.id);
    expect(label.id).not.toBe('');
    expect(control).toHaveAttribute('aria-labelledby', label.id);
    expect(description.id).not.toBe('');
    expect(control).toHaveAttribute('aria-describedby', description.id);
  });

  it('preserves deduplicated consumer descriptions alongside generated message IDs', () => {
    render(
      <Field.Root invalid>
        <Field.Label>Email</Field.Label>
        <Input aria-describedby='external external' />
        <Field.Description>Description</Field.Description>
        <Field.Error>Error</Field.Error>
      </Field.Root>,
    );

    const control = screen.getByRole('textbox', { name: 'Email' });
    const description = screen.getByText('Description');
    const error = screen.getByText('Error').closest('p');
    expect(control).toHaveAttribute('aria-describedby', `external ${description.id} ${error?.id}`);
  });

  it('only references label and message parts that are rendered', () => {
    render(
      <Field.Root invalid>
        <Input aria-label='Email' />
        <Field.Error>Email is invalid.</Field.Error>
      </Field.Root>,
    );

    const control = screen.getByRole('textbox', { name: 'Email' });
    const error = screen.getByText('Email is invalid.').closest('p');
    expect(control).not.toHaveAttribute('aria-labelledby');
    expect(control).toHaveAttribute('aria-describedby', error?.id);
  });

  it('registers multiple descriptions without duplicate IDs', () => {
    render(
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Input />
        <Field.Description>Primary description</Field.Description>
        <Field.Description>Secondary description</Field.Description>
      </Field.Root>,
    );

    const control = screen.getByRole('textbox', { name: 'Email' });
    const primary = screen.getByText('Primary description');
    const secondary = screen.getByText('Secondary description');
    expect(primary.id).not.toBe(secondary.id);
    expect(control).toHaveAttribute('aria-describedby', `${primary.id} ${secondary.id}`);
  });

  it('uses the field-owned control ID when Input provides its own ID', () => {
    render(
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Input id='account-email' />
      </Field.Root>,
    );

    const control = screen.getByRole('textbox', { name: 'Email' });
    expect(control).not.toHaveAttribute('id', 'account-email');
    expect(screen.getByText('Email')).toHaveAttribute('for', control.id);
  });

  it('keeps the field-owned control ID stable when the Input ID changes', () => {
    const { rerender } = render(
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Input id='account-email' />
      </Field.Root>,
    );
    const controlId = screen.getByRole('textbox', { name: 'Email' }).id;

    rerender(
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Input id='billing-email' />
      </Field.Root>,
    );

    expect(screen.getByText('Email')).toHaveAttribute('for', controlId);
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('id', controlId);
  });

  it('propagates semantic state while the rendered control owns its size', () => {
    render(
      <Field.Root
        invalid
        disabled
        required
        data-testid='root'
      >
        <Field.Label>Website</Field.Label>
        <Input size='lg' />
        <Field.Description>Description</Field.Description>
        <Field.Error>Error</Field.Error>
      </Field.Root>,
    );

    const root = screen.getByTestId('root');
    const control = screen.getByRole('textbox', { name: 'Website' });
    const label = screen.getByText('Website');
    const description = screen.getByText('Description');
    const error = screen.getByText('Error').closest('p');
    expect(root).toHaveAttribute('data-invalid', '');
    expect(root).toHaveAttribute('data-disabled', '');
    expect(root).toHaveAttribute('data-required', '');
    expect(root).not.toHaveAttribute('data-size');
    expect(control).toHaveAttribute('data-size', 'lg');
    expect(control).toHaveClass('cl-input', 'cl-field-control');
    expect(control).toHaveAttribute('aria-labelledby', label.id);
    expect(control).toHaveAttribute('aria-describedby', `${description.id} ${error?.id}`);
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAttribute('aria-disabled', 'true');
    expect(control).toHaveAttribute('aria-required', 'true');
    expect(control).toBeDisabled();
    expect(control).toBeRequired();
    expect(screen.getByText('Website')).not.toHaveAttribute('data-size');
  });

  it('adds the error relationship only while the root is invalid', () => {
    const { rerender } = render(
      <Field.Root>
        <Field.Label>Name</Field.Label>
        <Input />
        <Field.Description>Description</Field.Description>
        <Field.Error>Error</Field.Error>
      </Field.Root>,
    );

    const control = screen.getByRole('textbox', { name: 'Name' });
    const description = screen.getByText('Description');
    const error = screen.getByText('Error').closest('p');
    expect(control).toHaveAttribute('aria-describedby', description.id);
    expect(control).not.toHaveAttribute('aria-invalid');

    rerender(
      <Field.Root invalid>
        <Field.Label>Name</Field.Label>
        <Input />
        <Field.Description>Description</Field.Description>
        <Field.Error>Error</Field.Error>
      </Field.Root>,
    );

    expect(control).toHaveAttribute('aria-describedby', `${description.id} ${error?.id}`);
    expect(control).toHaveAttribute('aria-invalid', 'true');
  });

  it('hydrates the field-owned control ID and generated relationships without warnings', async () => {
    const field = (
      <Field.Root invalid>
        <Field.Label>Email</Field.Label>
        <Input id='account-email' />
        <Field.Description>Description</Field.Description>
        <Field.Error>Error</Field.Error>
      </Field.Root>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(field);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(() => {
      root = hydrateRoot(container, field);
    });

    expect(consoleError).not.toHaveBeenCalled();
    const control = container.querySelector('input');
    const description = container.querySelector('.cl-field-description');
    const error = container.querySelector('.cl-field-error');
    expect(control).not.toHaveAttribute('id', 'account-email');
    expect(container.querySelector('label')).toHaveAttribute('for', control?.id);
    expect(control?.getAttribute('aria-describedby')).toBe(`${description?.id} ${error?.id}`);

    await act(() => root?.unmount());
    consoleError.mockRestore();
  });

  it('keeps error announcements opt-in', () => {
    render(
      <Field.Root invalid>
        <Field.Label>Email</Field.Label>
        <Input />
        <Field.Error>Email is invalid.</Field.Error>
      </Field.Root>,
    );

    const error = screen.getByText('Email is invalid.').closest('p');
    expect(error).not.toHaveAttribute('role');
    expect(error).not.toHaveAttribute('aria-live');
    expect(error?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards refs from every part', () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const labelRef = React.createRef<HTMLLabelElement>();
    const controlRef = React.createRef<HTMLInputElement>();
    const descriptionRef = React.createRef<HTMLParagraphElement>();
    const errorRef = React.createRef<HTMLParagraphElement>();

    render(
      <Field.Root ref={rootRef}>
        <Field.Label ref={labelRef}>Email</Field.Label>
        <Input ref={controlRef} />
        <Field.Description ref={descriptionRef}>Description</Field.Description>
        <Field.Error ref={errorRef}>Error</Field.Error>
      </Field.Root>,
    );

    expect(rootRef.current).toHaveClass('cl-field-root');
    expect(labelRef.current).toBe(screen.getByText('Email'));
    expect(controlRef.current).toBe(screen.getByRole('textbox', { name: 'Email' }));
    expect(descriptionRef.current).toBe(screen.getByText('Description'));
    expect(errorRef.current).toBe(screen.getByText('Error').closest('p'));
  });

  it('lets caller styling win without prescribing layout', () => {
    render(
      <Field.Root
        className='root'
        style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}
        data-testid='root'
      >
        <Field.Label
          className='label'
          style={{ fontWeight: 700 }}
        >
          Email
        </Field.Label>
        <Input
          className='control'
          style={{ paddingInline: 16 }}
        />
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
    expect(screen.getByTestId('root')).toHaveStyle({ display: 'grid', gridTemplateColumns: '1fr 2fr' });
    expect(screen.getByText('Email')).toHaveClass('cl-field-label', 'label');
    expect(screen.getByText('Email')).toHaveStyle({ fontWeight: 700 });
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveClass('cl-field-control', 'control');
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveStyle({ paddingInline: 16 });
    expect(screen.getByText('Description')).toHaveClass('cl-field-description', 'description');
    expect(screen.getByText('Description')).toHaveStyle({ opacity: 0.8 });
    expect(screen.getByText('Error').closest('p')).toHaveClass('cl-field-error', 'error');
    expect(screen.getByText('Error').closest('p')).toHaveStyle({ fontWeight: 600 });
  });

  it('supports render escape hatches on structural parts', () => {
    render(
      <Field.Root render={props => <section {...props} />}>
        <Field.Label>Biography</Field.Label>
        <Input />
        <Field.Description render={props => <div {...props} />}>Description</Field.Description>
        <Field.Error render={props => <div {...props} />}>Error</Field.Error>
      </Field.Root>,
    );

    expect(screen.getByText('Description').tagName).toBe('DIV');
    expect(screen.getByText('Error').closest('div')).toHaveClass('cl-field-error');
    expect(screen.getByText('Biography').closest('section')).not.toBeNull();
  });

  it('warns when Field.Label does not render a native label', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    render(
      <Field.Root>
        <Field.Label render={<div />}>Email</Field.Label>
        <Input />
      </Field.Root>,
    );

    expect(consoleWarn).toHaveBeenCalledWith('[clerk] <Field.Label> must render a native `<label>` element.');
    consoleWarn.mockRestore();
  });

  it('fails clearly when a part is rendered outside the root', () => {
    expect(() => renderToString(<Field.Label>Orphan</Field.Label>)).toThrow(
      '<Field.Label> must be rendered inside <Field.Root>.',
    );
  });
});
