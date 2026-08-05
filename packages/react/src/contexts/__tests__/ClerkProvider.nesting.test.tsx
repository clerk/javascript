import { render } from '@testing-library/react';
import React from 'react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('../../isomorphicClerk', () => {
  let instance: any;
  class IsomorphicClerk {
    status = 'loading';
    on = vi.fn();
    off = vi.fn();
    __internal_updateProps = vi.fn().mockResolvedValue(undefined);
    static getOrCreateInstance() {
      instance ??= new IsomorphicClerk();
      return instance;
    }
    static clearInstance() {
      instance = undefined;
    }
  }
  return { IsomorphicClerk };
});

import { ClerkProvider } from '../ClerkProvider';

const pk = 'pk_test_Y2xlcmsuY2xlcmsuZGV2JA';

const originalError = console.error;

describe('ClerkProvider duplicate detection', () => {
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('throws when a ClerkProvider is nested inside another ClerkProvider', () => {
    expect(() =>
      render(
        <ClerkProvider publishableKey={pk}>
          <ClerkProvider publishableKey={pk}>
            <div />
          </ClerkProvider>
        </ClerkProvider>,
      ),
    ).toThrow(/multiple <ClerkProvider>/);
  });

  it('does not throw when a second React root mounts while the first is still mounted', () => {
    const first = render(
      <ClerkProvider publishableKey={pk}>
        <div />
      </ClerkProvider>,
    );
    expect(() =>
      render(
        <ClerkProvider publishableKey={pk}>
          <div />
        </ClerkProvider>,
      ),
    ).not.toThrow();
    first.unmount();
  });
});
