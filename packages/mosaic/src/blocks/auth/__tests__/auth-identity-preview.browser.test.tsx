import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Card } from '../../../components/card';
import { AuthIdentityPreview } from '../auth-identity-preview';

afterEach(() => cleanup());

describe('AuthIdentityPreview', () => {
  it('keeps an email in reading order in a right-to-left layout', () => {
    render(
      <div dir='rtl'>
        <Card.Root renderBranding={false}>
          <Card.Header>
            <AuthIdentityPreview identifier='jane@acme.com' />
          </Card.Header>
        </Card.Root>
      </div>,
    );

    const node = screen.getByText('jane@acme.com').firstChild!;
    const rect = (start: number, end: number) => {
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, end);
      return range.getBoundingClientRect();
    };
    expect(rect(0, 4).right).toBeLessThanOrEqual(rect(4, 13).left + 1);
  });

  it('keeps a phone number in reading order in a right-to-left layout', () => {
    render(
      <div dir='rtl'>
        <Card.Root renderBranding={false}>
          <Card.Header>
            <AuthIdentityPreview identifier='+1 (555) 123-4567' />
          </Card.Header>
        </Card.Root>
      </div>,
    );

    const node = screen.getByText('+1 (555) 123-4567').firstChild!;
    const rect = (start: number, end: number) => {
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, end);
      return range.getBoundingClientRect();
    };
    expect(rect(0, 2).left).toBeLessThan(rect(13, 17).left);
  });
});
