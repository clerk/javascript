import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let capturedChildren: React.ReactNode;

vi.mock('@clerk/react/internal', () => ({
  InternalClerkProvider: ({ children }: { children: React.ReactNode }) => {
    capturedChildren = children;
    return null;
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock('../../server-actions', () => ({
  invalidateCacheAction: vi.fn(),
}));

vi.mock('../useAwaitablePush', () => ({
  useAwaitablePush: () => vi.fn(),
}));

vi.mock('../useAwaitableReplace', () => ({
  useAwaitableReplace: () => vi.fn(),
}));

vi.mock('../../../utils/router-telemetry', () => ({
  RouterTelemetry: () => null,
}));

vi.mock('../ClerkScripts', () => ({
  ClerkScripts: () => null,
}));

import { ClientClerkProvider } from '../ClerkProvider';

const childrenOf = (node: React.ReactNode): React.ReactElement[] => {
  if (!Array.isArray(node)) {
    throw new Error('Expected the provider to receive an array of children');
  }
  return node as React.ReactElement[];
};

describe('ClientClerkProvider', () => {
  beforeEach(() => {
    capturedChildren = undefined;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('keys every child it passes to the React provider', () => {
    render(
      <ClientClerkProvider
        publishableKey='pk_test_123'
        disableKeyless
      >
        <span>content</span>
      </ClientClerkProvider>,
    );

    expect(childrenOf(capturedChildren).map(child => child.key)).toEqual([
      'clerk-router-telemetry',
      'clerk-scripts',
      'clerk-children',
    ]);
  });

  it('keeps the key of a scripts slot supplied by the server provider', () => {
    render(
      <ClientClerkProvider
        publishableKey='pk_test_123'
        disableKeyless
        __internal_scriptsSlot={<span key='clerk-scripts'>scripts</span>}
      >
        <span>content</span>
      </ClientClerkProvider>,
    );

    expect(childrenOf(capturedChildren).every(child => child.key !== null)).toBe(true);
  });
});
