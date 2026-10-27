import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { IsomorphicClerk } from '../../isomorphicClerk';
import { ClerkProvider } from '../ClerkProvider';

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

describe('ClerkProvider status subscription', () => {
  it('subscribes with notify so a remount receives the current status', () => {
    const { unmount } = render(
      <ClerkProvider publishableKey='pk_test_Y2xlcmsuY2xlcmsuZGV2JA'>
        <div />
      </ClerkProvider>,
    );
    const instance = IsomorphicClerk.getOrCreateInstance({} as any) as any;

    expect(instance.on).toHaveBeenCalledWith('status', expect.any(Function), { notify: true });
    unmount();
  });
});
