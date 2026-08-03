// @vitest-environment node

import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { TextField } from './text-field';

describe('Mosaic TextField SSR', () => {
  it('emits complete label and message relationships on the first render', () => {
    const html = renderToString(
      <TextField.Root
        invalid
        required
        ids={{
          control: 'email',
          label: 'email-label',
          description: 'email-description',
          error: 'email-error',
        }}
      >
        <TextField.Label>Email</TextField.Label>
        <TextField.Content>
          <TextField.Input aria-describedby='external' />
          <TextField.Description>Description</TextField.Description>
          <TextField.Error>Error</TextField.Error>
        </TextField.Content>
      </TextField.Root>,
    );

    expect(html).toContain('for="email"');
    expect(html).toContain('id="email-label"');
    expect(html).toContain('id="email-description"');
    expect(html).toContain('id="email-error"');
    expect(html).toContain('aria-describedby="external email-description email-error"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('required=""');
  });
});
