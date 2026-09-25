import type * as SharedReact from '@clerk/shared/react';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMosaicSupportEmail } from '../useMosaicSupportEmail';

let supportEmailFromOptions: string | undefined;
let frontendApi: string;
let environmentHydrated: boolean;
let supportEmailFromEnvironment: string;

function environment() {
  return environmentHydrated ? { displayConfig: { supportEmail: supportEmailFromEnvironment } } : undefined;
}

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useClerk: () => ({
      frontendApi,
      __internal_getOption: (key: string) => (key === 'supportEmail' ? supportEmailFromOptions : undefined),
    }),
  };
});

vi.mock('../useMosaicEnvironment', () => ({
  useMosaicEnvironment: () => environment(),
}));

describe('useMosaicSupportEmail', () => {
  beforeEach(() => {
    supportEmailFromOptions = undefined;
    frontendApi = '';
    environmentHydrated = true;
    supportEmailFromEnvironment = '';
  });

  it('uses the ClerkProvider option over the environment', () => {
    supportEmailFromOptions = 'option@email.com';
    supportEmailFromEnvironment = 'env@email.com';

    const { result } = renderHook(() => useMosaicSupportEmail());

    expect(result.current).toBe('option@email.com');
  });

  it('returns the option before the environment hydrates', () => {
    supportEmailFromOptions = 'option@email.com';
    environmentHydrated = false;

    const { result } = renderHook(() => useMosaicSupportEmail());

    expect(result.current).toBe('option@email.com');
  });

  it('uses the environment when no option is set', () => {
    supportEmailFromEnvironment = 'env@email.com';

    const { result } = renderHook(() => useMosaicSupportEmail());

    expect(result.current).toBe('env@email.com');
  });

  it('falls back to the Frontend API host when neither source is set', () => {
    const { result } = renderHook(() => useMosaicSupportEmail());

    expect(result.current).toBe('support@clerk.com');
  });

  it('strips the clerk. prefix from the Frontend API host', () => {
    frontendApi = 'clerk.example.com';

    const { result } = renderHook(() => useMosaicSupportEmail());

    expect(result.current).toBe('support@example.com');
  });

  it('is undefined until the environment hydrates when no option is set', () => {
    environmentHydrated = false;

    const { result } = renderHook(() => useMosaicSupportEmail());

    expect(result.current).toBeUndefined();
  });
});
