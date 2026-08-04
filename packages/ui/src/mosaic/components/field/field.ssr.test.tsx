// @vitest-environment node

import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Input } from '../input';
import { Field } from './field';

describe('Mosaic Field SSR', () => {
  it('emits the field-owned control ID and stable part IDs', () => {
    const html = renderToString(
      <Field.Root
        invalid
        required
      >
        <Field.Label>Email</Field.Label>
        <Input
          id='account-email'
          aria-describedby='external'
        />
        <Field.Description>Description</Field.Description>
        <Field.Error>Error</Field.Error>
      </Field.Root>,
    );

    const labelControlId = html.match(/for="([^"]+)"/)?.[1];
    const inputControlId = html.match(/<input[^>]*\sid="([^"]+)"/)?.[1];
    expect(labelControlId).toBeDefined();
    expect(labelControlId).toBe(inputControlId);
    expect(inputControlId).not.toBe('account-email');
    expect(html).toMatch(/id="cl-field-[^"]+-label"/);
    expect(html).toMatch(/id="cl-field-[^"]+-description"/);
    expect(html).toMatch(/id="cl-field-[^"]+-error"/);
    expect(html).toContain('aria-describedby="external"');
    expect(html).not.toContain('aria-labelledby');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('required=""');
  });
});
