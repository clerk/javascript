import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Card } from './card';

afterEach(() => cleanup());

describe('Card.Media', () => {
  it('leaves 24px between the media and the title', () => {
    render(
      <Card.Root renderBranding={false}>
        <Card.Header>
          <Card.Media data-testid='media'>
            <svg
              width='32'
              height='32'
            />
          </Card.Media>
          <Card.Title data-testid='title'>Title</Card.Title>
          <Card.Description>Description</Card.Description>
        </Card.Header>
      </Card.Root>,
    );

    const mediaBottom = screen.getByTestId('media').getBoundingClientRect().bottom;
    const titleTop = screen.getByTestId('title').getBoundingClientRect().top;

    expect(titleTop - mediaBottom).toBe(24);
  });
});
