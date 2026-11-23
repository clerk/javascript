import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Badge } from '../badge';
import { Entity } from '.';

afterEach(() => cleanup());

describe('Entity.Label', () => {
  it('truncates the label text and keeps a badge beside it whole', () => {
    render(
      <div style={{ width: 160 }}>
        <Entity.Label>
          Cameron Alexander Walker
          <Badge>Default</Badge>
        </Entity.Label>
      </div>,
    );

    const name = screen.getByText('Cameron Alexander Walker');
    const badgeText = screen.getByText('Default');

    expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
    expect(badgeText.scrollWidth).toBe(badgeText.clientWidth);
  });
});
