import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { TextField } from './text-field';

describe('Mosaic TextField', () => {
  it('associates generated label and description IDs with the input', () => {
    render(
      <TextField.Root>
        <TextField.Label>Email</TextField.Label>
        <TextField.Content>
          <TextField.Input />
          <TextField.Description>Used for account notifications.</TextField.Description>
        </TextField.Content>
      </TextField.Root>,
    );

    const input = screen.getByRole('textbox', { name: 'Email' });
    const label = screen.getByText('Email');
    const description = screen.getByText('Used for account notifications.');

    expect(input.id).not.toBe('');
    expect(label).toHaveAttribute('for', input.id);
    expect(label).toHaveAttribute('id', `${input.id}-label`);
    expect(description).toHaveAttribute('id', `${input.id}-description`);
    expect(input).toHaveAttribute('aria-describedby', `${input.id}-description`);
  });

  it('uses explicit IDs and preserves deduplicated consumer descriptions', () => {
    render(
      <TextField.Root
        invalid
        ids={{
          control: 'email',
          label: 'email-label',
          description: 'email-description',
          error: 'email-error',
        }}
      >
        <TextField.Label>Email</TextField.Label>
        <TextField.Content>
          <TextField.Input aria-describedby='external email-description external' />
          <TextField.Description>Description</TextField.Description>
          <TextField.Error>Error</TextField.Error>
        </TextField.Content>
      </TextField.Root>,
    );

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('id', 'email');
    expect(screen.getByText('Email')).toHaveAttribute('id', 'email-label');
    expect(screen.getByText('Description')).toHaveAttribute('id', 'email-description');
    expect(screen.getByText('Error').closest('p')).toHaveAttribute('id', 'email-error');
    expect(input).toHaveAttribute('aria-describedby', 'external email-description email-error');
  });

  it('propagates size and semantic state from the root', () => {
    render(
      <TextField.Root
        size='lg'
        invalid
        disabled
        required
        data-testid='root'
      >
        <TextField.Label>Website</TextField.Label>
        <TextField.Content data-testid='content'>
          <TextField.Input />
          <TextField.Description>Description</TextField.Description>
          <TextField.Error>Error</TextField.Error>
        </TextField.Content>
      </TextField.Root>,
    );

    const root = screen.getByTestId('root');
    const input = screen.getByRole('textbox', { name: 'Website' });
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-invalid', '');
    expect(root).toHaveAttribute('data-disabled', '');
    expect(root).toHaveAttribute('data-required', '');
    expect(input).toHaveAttribute('data-size', 'lg');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(screen.getByText('Website')).toHaveAttribute('data-size', 'lg');
    expect(screen.getByTestId('content')).toHaveAttribute('data-disabled', '');
  });

  it.each(['stacked', 'horizontal'] as const)('reflects the %s layout on all parts', layout => {
    render(
      <TextField.Root
        layout={layout}
        data-testid='root'
      >
        <TextField.Label>Username</TextField.Label>
        <TextField.Content data-testid='content'>
          <TextField.Input />
          <TextField.Description>Description</TextField.Description>
        </TextField.Content>
      </TextField.Root>,
    );

    expect(screen.getByTestId('root')).toHaveAttribute('data-layout', layout);
    expect(screen.getByText('Username')).toHaveAttribute('data-layout', layout);
    expect(screen.getByTestId('content')).toHaveAttribute('data-layout', layout);
    expect(screen.getByRole('textbox', { name: 'Username' })).toHaveAttribute('data-layout', layout);
    expect(screen.getByText('Description')).toHaveAttribute('data-layout', layout);
  });

  it('adds the error relationship only while the root is invalid', () => {
    const { rerender } = render(
      <TextField.Root ids={{ control: 'name' }}>
        <TextField.Label>Name</TextField.Label>
        <TextField.Content>
          <TextField.Input />
          <TextField.Description>Description</TextField.Description>
          <TextField.Error>Error</TextField.Error>
        </TextField.Content>
      </TextField.Root>,
    );

    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveAttribute('aria-describedby', 'name-description');
    expect(input).not.toHaveAttribute('aria-invalid');

    rerender(
      <TextField.Root
        invalid
        ids={{ control: 'name' }}
      >
        <TextField.Label>Name</TextField.Label>
        <TextField.Content>
          <TextField.Input />
          <TextField.Description>Description</TextField.Description>
          <TextField.Error>Error</TextField.Error>
        </TextField.Content>
      </TextField.Root>,
    );

    expect(input).toHaveAttribute('aria-describedby', 'name-description name-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('hydrates generated relationships without warnings', async () => {
    const field = (
      <TextField.Root invalid>
        <TextField.Label>Email</TextField.Label>
        <TextField.Content>
          <TextField.Input />
          <TextField.Description>Description</TextField.Description>
          <TextField.Error>Error</TextField.Error>
        </TextField.Content>
      </TextField.Root>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(field);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(() => {
      root = hydrateRoot(container, field);
    });

    expect(consoleError).not.toHaveBeenCalled();
    const input = container.querySelector('input');
    expect(input?.getAttribute('aria-describedby')).toBe(`${input?.id}-description ${input?.id}-error`);

    await act(() => root?.unmount());
    consoleError.mockRestore();
  });

  it('keeps error announcements opt-in', () => {
    render(
      <TextField.Root invalid>
        <TextField.Label>Email</TextField.Label>
        <TextField.Content>
          <TextField.Input />
          <TextField.Error>Email is invalid.</TextField.Error>
        </TextField.Content>
      </TextField.Root>,
    );

    const error = screen.getByText('Email is invalid.').closest('p');
    expect(error).not.toHaveAttribute('role');
    expect(error).not.toHaveAttribute('aria-live');
    expect(error?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards native input props and refs', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <TextField.Root>
        <TextField.Label>Display name</TextField.Label>
        <TextField.Content>
          <TextField.Input
            ref={ref}
            name='displayName'
            autoComplete='name'
          />
        </TextField.Content>
      </TextField.Root>,
    );

    const input = screen.getByRole('textbox', { name: 'Display name' });
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('name', 'displayName');
    expect(input).toHaveAttribute('autocomplete', 'name');
  });

  it('forwards refs from every structural part', () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const labelRef = React.createRef<HTMLLabelElement>();
    const contentRef = React.createRef<HTMLDivElement>();
    const descriptionRef = React.createRef<HTMLParagraphElement>();
    const errorRef = React.createRef<HTMLParagraphElement>();

    render(
      <TextField.Root ref={rootRef}>
        <TextField.Label ref={labelRef}>Email</TextField.Label>
        <TextField.Content ref={contentRef}>
          <TextField.Input />
          <TextField.Description ref={descriptionRef}>Description</TextField.Description>
          <TextField.Error ref={errorRef}>Error</TextField.Error>
        </TextField.Content>
      </TextField.Root>,
    );

    expect(rootRef.current).toHaveClass('cl-text-field-root');
    expect(labelRef.current).toBe(screen.getByText('Email'));
    expect(contentRef.current).toHaveClass('cl-text-field-content');
    expect(descriptionRef.current).toBe(screen.getByText('Description'));
    expect(errorRef.current).toBe(screen.getByText('Error').closest('p'));
  });

  it('lets consumer data attributes override reflected variants', () => {
    render(
      <TextField.Root
        layout='horizontal'
        data-layout='consumer'
        data-testid='root'
      >
        <TextField.Label>Email</TextField.Label>
        <TextField.Content>
          <TextField.Input data-size='consumer' />
        </TextField.Content>
      </TextField.Root>,
    );

    expect(screen.getByTestId('root')).toHaveAttribute('data-layout', 'consumer');
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('data-size', 'consumer');
  });

  it('lets consumer classes and inline styles win on every part', () => {
    render(
      <TextField.Root
        className='root'
        style={{ width: '40rem' }}
        data-testid='root'
      >
        <TextField.Label
          className='label'
          style={{ fontWeight: 700 }}
        >
          Email
        </TextField.Label>
        <TextField.Content
          className='content'
          style={{ rowGap: 12 }}
          data-testid='content'
        >
          <TextField.Input
            className='input'
            style={{ paddingInline: 16 }}
          />
          <TextField.Description
            className='description'
            style={{ opacity: 0.8 }}
          >
            Description
          </TextField.Description>
          <TextField.Error
            className='error'
            style={{ fontWeight: 600 }}
          >
            Error
          </TextField.Error>
        </TextField.Content>
      </TextField.Root>,
    );

    expect(screen.getByTestId('root')).toHaveClass('cl-text-field-root', 'root');
    expect(screen.getByTestId('root')).toHaveStyle({ width: '40rem' });
    expect(screen.getByText('Email')).toHaveClass('cl-text-field-label', 'label');
    expect(screen.getByText('Email')).toHaveStyle({ fontWeight: 700 });
    expect(screen.getByTestId('content')).toHaveClass('cl-text-field-content', 'content');
    expect(screen.getByTestId('content')).toHaveStyle({ rowGap: 12 });
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveClass('cl-input', 'cl-text-field-input', 'input');
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveStyle({ paddingInline: 16 });
    expect(screen.getByText('Description')).toHaveClass('cl-text-field-description', 'description');
    expect(screen.getByText('Description')).toHaveStyle({ opacity: 0.8 });
    expect(screen.getByText('Error').closest('p')).toHaveClass('cl-text-field-error', 'error');
    expect(screen.getByText('Error').closest('p')).toHaveStyle({ fontWeight: 600 });
  });

  it('supports custom elements through render on every part', () => {
    render(
      <TextField.Root render={props => <section {...props} />}>
        <TextField.Label render={props => <label {...props} />}>Biography</TextField.Label>
        <TextField.Content render={props => <section {...props} />}>
          <TextField.Input render={<textarea />} />
          <TextField.Description render={props => <div {...props} />}>Description</TextField.Description>
          <TextField.Error render={props => <div {...props} />}>Error</TextField.Error>
        </TextField.Content>
      </TextField.Root>,
    );

    const input = screen.getByRole('textbox', { name: 'Biography' });
    expect(input.tagName).toBe('TEXTAREA');
    expect(input.closest('section')?.parentElement?.tagName).toBe('SECTION');
    expect(screen.getByText('Description').tagName).toBe('DIV');
    expect(screen.getByText('Error').closest('div')).toHaveClass('cl-text-field-error');
  });

  it('fails clearly when a part is rendered outside the root', () => {
    expect(() => renderToString(<TextField.Input aria-label='Orphan' />)).toThrow(
      '<TextField.Input> must be rendered inside <TextField.Root>.',
    );
  });
});
