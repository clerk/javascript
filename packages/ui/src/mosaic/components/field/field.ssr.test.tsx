// @vitest-environment node

import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Input } from '../input';
import { Field } from './field';

describe('Mosaic Field SSR', () => {
  it('emits render-time relationships and defers registered relationships until hydration', () => {
    const html = renderToString(
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Input
          name='email'
          required
          aria-describedby='external-description'
          aria-invalid='true'
        />
        <Field.Description>Description</Field.Description>
        <Field.Error>Error</Field.Error>
      </Field.Root>,
    );

    const labelControlId = html.match(/for="([^"]+)"/)?.[1];
    const inputControlId = html.match(/<input[^>]*\sid="([^"]+)"/)?.[1];
    const input = html.match(/<input[^>]*>/)?.[0];
    const descriptionId = html.match(/id="([^"]+-description)"/)?.[1];
    const errorId = html.match(/id="([^"]+-error)"/)?.[1];
    expect(labelControlId).toBeDefined();
    expect(labelControlId).toBe(inputControlId);
    expect(descriptionId).toBeDefined();
    expect(errorId).toBeDefined();
    expect(html).toContain('name="email"');
    expect(input).toContain('aria-describedby="external-description"');
    expect(input).not.toContain('aria-labelledby');
    expect(input).not.toContain(descriptionId);
    expect(input).not.toContain(errorId);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toMatch(/id="cl-field-[^"]+-label"/);
    expect(html).toMatch(/id="cl-field-[^"]+-description"/);
    expect(html).toMatch(/id="cl-field-[^"]+-error"/);
    expect(html).toContain('required=""');
    expect(html).not.toContain('cl-field-control');
  });

  it('defers an explicit control ID until hydration', () => {
    const html = renderToString(
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Input id='custom-control' />
      </Field.Root>,
    );

    const labelControlId = html.match(/for="([^"]+)"/)?.[1];
    const inputControlId = html.match(/<input[^>]*\sid="([^"]+)"/)?.[1];
    expect(inputControlId).toBeDefined();
    expect(inputControlId).not.toBe('custom-control');
    expect(labelControlId).toBe(inputControlId);
    expect(html).not.toContain('id="custom-control"');
  });
});
