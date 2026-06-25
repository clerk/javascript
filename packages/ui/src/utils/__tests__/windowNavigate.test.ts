import { CLERK_BEFORE_UNLOAD_EVENT } from '@clerk/shared/internal/clerk-js/windowNavigate';
import type { Clerk } from '@clerk/shared/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clerkWindowNavigate } from '../windowNavigate';

describe('clerkWindowNavigate', () => {
  let originalLocation: Location;
  let hrefSetter: ReturnType<typeof vi.fn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let eventSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    originalLocation = window.location;
    hrefSetter = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: new Proxy(
        { href: 'https://example.com/' },
        {
          set: (target, prop, value) => {
            if (prop === 'href') {
              hrefSetter(value);
              (target as any).href = value;
              return true;
            }
            (target as any)[prop] = value;
            return true;
          },
        },
      ),
    });
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    eventSpy = vi.fn();
    window.addEventListener(CLERK_BEFORE_UNLOAD_EVENT, eventSpy);
  });

  afterEach(() => {
    window.removeEventListener(CLERK_BEFORE_UNLOAD_EVENT, eventSpy);
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    warnSpy.mockRestore();
  });

  it('delegates to the Clerk navigation chokepoint when available', () => {
    const clerk = {
      __internal_windowNavigate: vi.fn(),
    } as unknown as Clerk;
    const opts = { useStaticAllowlistOnly: true };

    clerkWindowNavigate(clerk, '/sign-in', opts);

    expect(clerk.__internal_windowNavigate).toHaveBeenCalledWith('/sign-in', opts);
    expect(hrefSetter).not.toHaveBeenCalled();
    expect(eventSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('falls back to static allowlist navigation when ClerkJS is older', () => {
    const clerk = {} as unknown as Clerk;

    clerkWindowNavigate(clerk, '/sign-in');

    expect(hrefSetter).toHaveBeenCalledWith('https://example.com/sign-in');
    expect(eventSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('fails closed for disallowed protocols when ClerkJS is older', () => {
    const clerk = {} as unknown as Clerk;

    clerkWindowNavigate(clerk, 'javascript:alert(1)');

    expect(hrefSetter).not.toHaveBeenCalled();
    expect(eventSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('fails closed for customer-extended protocols when ClerkJS is older', () => {
    const clerk = {} as unknown as Clerk;

    clerkWindowNavigate(clerk, 'slack://channel/123');

    expect(hrefSetter).not.toHaveBeenCalled();
    expect(eventSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('fails closed for control-character scheme-relative bypasses when ClerkJS is older', () => {
    const clerk = {} as unknown as Clerk;

    clerkWindowNavigate(clerk, '/\t/evil.example/path');

    expect(hrefSetter).not.toHaveBeenCalled();
    expect(eventSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
