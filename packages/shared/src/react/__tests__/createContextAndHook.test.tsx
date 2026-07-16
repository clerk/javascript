import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { createContextAndHook } from '../hooks/createContextAndHook';

afterEach(() => {
  // Reset the cross-instance registry between tests.
  globalThis.__clerk_shared_react_contexts = undefined;
});

describe('createContextAndHook', () => {
  it('returns the same context object for repeated calls with the same display name', () => {
    const [CtxA] = createContextAndHook<{ label: string }>('SharedContext');
    const [CtxB] = createContextAndHook<{ label: string }>('SharedContext');

    // A duplicated module instance would call createContextAndHook again; both must
    // resolve to one context object so provider/consumer identity matches.
    expect(CtxA).toBe(CtxB);
  });

  it('returns different context objects for different display names', () => {
    const [CtxA] = createContextAndHook<{ label: string }>('ContextOne');
    const [CtxB] = createContextAndHook<{ label: string }>('ContextTwo');

    expect(CtxA).not.toBe(CtxB);
  });

  it('lets a provider from one instance satisfy a hook from a duplicate instance', () => {
    // Simulate two separately-bundled copies of this module by calling the factory twice.
    const [ProviderCtx] = createContextAndHook<{ label: string }>('DuplicatedContext');
    const [, useDuplicatedContext] = createContextAndHook<{ label: string }>('DuplicatedContext');

    const Consumer = () => {
      const { label } = useDuplicatedContext();
      return <div data-testid='value'>{label}</div>;
    };

    render(
      <ProviderCtx.Provider value={{ value: { label: 'from-provider' } }}>
        <Consumer />
      </ProviderCtx.Provider>,
    );

    expect(screen.getByTestId('value').textContent).toBe('from-provider');
  });

  it('still throws when the hook is used without a provider', () => {
    const [, useMissingContext] = createContextAndHook<{ label: string }>('MissingContext');

    const Consumer = () => {
      useMissingContext();
      return null;
    };

    expect(() => render(<Consumer />)).toThrow(/MissingContext not found/);
  });
});
