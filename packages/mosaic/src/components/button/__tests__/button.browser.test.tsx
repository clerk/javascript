import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { Plus } from '../../../icons/glyphs/plus';
import { Icon } from '../../icon/icon';
import { Button } from '../button';

afterEach(() => cleanup());

function padding(ui: React.ReactElement) {
  render(ui);
  const style = getComputedStyle(screen.getByRole('button'));
  return { start: style.paddingInlineStart, end: style.paddingInlineEnd };
}

describe('icon padding', () => {
  it('tightens the start side for a leading icon without placement', () => {
    expect(
      padding(
        <Button>
          <Icon glyph={Plus} />
          Add
        </Button>,
      ),
    ).toEqual({ start: '8px', end: '12px' });
  });

  it('tightens the end side for a trailing icon without placement', () => {
    expect(
      padding(
        <Button>
          Next
          <Icon glyph={Plus} />
        </Button>,
      ),
    ).toEqual({ start: '12px', end: '8px' });
  });

  it('keeps the default padding for text alone', () => {
    expect(padding(<Button>Add</Button>)).toEqual({ start: '12px', end: '12px' });
  });

  it('zeroes the padding for an icon-only button', () => {
    expect(
      padding(
        <Button
          shape='square'
          aria-label='Add'
        >
          <Icon glyph={Plus} />
        </Button>,
      ),
    ).toEqual({ start: '0px', end: '0px' });
  });
});
