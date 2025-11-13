import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppearanceProvider } from '../AppearanceContext';
import { Flow } from '../Flow';

describe('Flow.Root data-component-status behavior', () => {
  it('does not set data-component-status if prop is omitted', () => {
    const { container } = render(
      <AppearanceProvider appearanceKey='signIn'>
        <Flow.Root flow='signIn'>
          <div data-testid='child' />
        </Flow.Root>
        ,
      </AppearanceProvider>,
    );

    const host = container as HTMLElement | null;
    expect(host).toBeTruthy();
    // Attribute should not be present
    expect(host?.getAttribute('data-component-status')).toBeNull();
  });

  it('sets data-component-status="awaiting-data" when isFlowReady=false', async () => {
    const { container } = render(
      <AppearanceProvider appearanceKey='signIn'>
        <Flow.Root
          flow='signIn'
          isFlowReady={false}
        >
          <div data-testid='child' />
        </Flow.Root>
        ,
      </AppearanceProvider>,
    );

    const host = container as HTMLElement | null;
    expect(host).toBeTruthy();
    expect(host?.getAttribute('data-component-status')).toBe('awaiting-data');
  });

  it('sets data-component-status="ready" when isFlowReady=true', () => {
    const { container } = render(
      <AppearanceProvider appearanceKey='signIn'>
        <Flow.Root
          flow='signIn'
          isFlowReady
        >
          <div data-testid='child' />
        </Flow.Root>
        ,
      </AppearanceProvider>,
    );

    const host = container as HTMLElement | null;
    expect(host).toBeTruthy();
    expect(host?.getAttribute('data-component-status')).toBe('ready');
  });
});
