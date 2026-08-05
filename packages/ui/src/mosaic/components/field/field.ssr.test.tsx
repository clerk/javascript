// @vitest-environment node

import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Input } from '../input';
import { Field } from './field';

describe('Mosaic Field SSR', () => {
  it('emits complete caller-owned label and message relationships', () => {
    const html = renderToString(
      <Field.Root>
        <Field.Label
          id='email-label'
          htmlFor='account-email'
        >
          Email
        </Field.Label>
        <Input
          id='account-email'
          name='email'
          required
          aria-labelledby='email-label'
          aria-describedby='email-description email-error'
          aria-invalid='true'
        />
        <Field.Description id='email-description'>Description</Field.Description>
        <Field.Error id='email-error'>Error</Field.Error>
      </Field.Root>,
    );

    expect(html).toContain('id="email-label"');
    expect(html).toContain('for="account-email"');
    expect(html).toContain('id="account-email"');
    expect(html).toContain('name="email"');
    expect(html).toContain('aria-labelledby="email-label"');
    expect(html).toContain('aria-describedby="email-description email-error"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('id="email-description"');
    expect(html).toContain('id="email-error"');
    expect(html).toContain('required=""');
    expect(html).not.toContain('cl-field-control');
  });
});
