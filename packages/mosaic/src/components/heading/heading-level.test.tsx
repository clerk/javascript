import { render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Heading } from './heading';
import { HeadingLevelProvider, useHeadingLevel } from './heading-level';

function LevelHeading({ children }: { children: React.ReactNode }) {
  return <Heading level={useHeadingLevel()}>{children}</Heading>;
}

describe('HeadingLevelProvider', () => {
  it('sets the level its descendants read', () => {
    render(
      <HeadingLevelProvider level={3}>
        <LevelHeading>Title</LevelHeading>
      </HeadingLevelProvider>,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Title' })).toBeInTheDocument();
  });

  it('nests one level below its parent when no level is passed', () => {
    render(
      <HeadingLevelProvider level={2}>
        <LevelHeading>Outer</LevelHeading>
        <HeadingLevelProvider>
          <LevelHeading>Inner</LevelHeading>
        </HeadingLevelProvider>
      </HeadingLevelProvider>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Outer' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Inner' })).toBeInTheDocument();
  });

  it('stops nesting at level 6', () => {
    render(
      <HeadingLevelProvider level={6}>
        <HeadingLevelProvider>
          <LevelHeading>Deep</LevelHeading>
        </HeadingLevelProvider>
      </HeadingLevelProvider>,
    );
    expect(screen.getByRole('heading', { level: 6, name: 'Deep' })).toBeInTheDocument();
  });
});

describe('useHeadingLevel', () => {
  it('is level 2 outside a HeadingLevelProvider', () => {
    expect(renderHook(() => useHeadingLevel()).result.current).toBe(2);
  });

  it('nests one level below the default when no provider is above', () => {
    const { result } = renderHook(() => useHeadingLevel(), { wrapper: HeadingLevelProvider });
    expect(result.current).toBe(3);
  });
});
