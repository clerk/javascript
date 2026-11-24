import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthenticateWithRedirectCallback } from '../controlComponents';

const mockClerk = {
  handleRedirectCallback: vi.fn(),
} as any;

vi.mock('../withClerk', () => {
  return {
    withClerk: (Component: any) => (props: any) => {
      return (
        <Component
          {...props}
          clerk={mockClerk}
        />
      );
    },
  };
});

describe('<AuthenticateWithRedirectCallback />', () => {
  const unhandledRejections: unknown[] = [];
  const onUnhandledRejection = (reason: unknown) => unhandledRejections.push(reason);

  beforeEach(() => {
    unhandledRejections.length = 0;
    process.on('unhandledRejection', onUnhandledRejection);
  });

  afterEach(() => {
    process.off('unhandledRejection', onUnhandledRejection);
  });

  it('passes its props to handleRedirectCallback on mount', () => {
    mockClerk.handleRedirectCallback = vi.fn().mockResolvedValue(undefined);

    render(
      <AuthenticateWithRedirectCallback
        signInUrl='/sign-in'
        signUpUrl='/sign-up'
        signInForceRedirectUrl='/dashboard'
      />,
    );

    expect(mockClerk.handleRedirectCallback).toHaveBeenCalledTimes(1);
    expect(mockClerk.handleRedirectCallback).toHaveBeenCalledWith({
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
      signInForceRedirectUrl: '/dashboard',
    });
  });

  it('does not surface an unhandled rejection when handleRedirectCallback rejects', async () => {
    const calls: unknown[] = [];
    mockClerk.handleRedirectCallback = (params: unknown) => {
      calls.push(params);
      return Promise.reject(new Error('callback failed'));
    };

    render(<AuthenticateWithRedirectCallback />);

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(calls).toHaveLength(1);
    expect(unhandledRejections).toEqual([]);
  });
});
