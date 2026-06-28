import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { ALLOWED_PROTOCOLS, CLERK_BEFORE_UNLOAD_EVENT, windowNavigate } from '../windowNavigate';

describe('windowNavigate', () => {
  let originalLocation: Location;
  let hrefSetter: Mock<(value: unknown) => void>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let eventSpy: Mock<(event: Event) => void>;

  beforeEach(() => {
    originalLocation = window.location;
    hrefSetter = vi.fn<(value: unknown) => void>();
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
    eventSpy = vi.fn<(event: Event) => void>();
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

  it.each([
    ['absolute https URL', 'https://example.com/dashboard'],
    ['absolute http URL', 'http://example.com/dashboard'],
    ['relative path', '/sign-in'],
    ['wails protocol', 'wails://app/route'],
    ['chrome-extension protocol', 'chrome-extension://abc/route'],
  ])('navigates to %s', (_label, to) => {
    windowNavigate(to);
    expect(hrefSetter).toHaveBeenCalledTimes(1);
    expect(eventSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it.each([
    ['javascript', 'javascript:alert(1)'],
    ['data', 'data:text/html,<script>alert(1)</script>'],
    ['file', 'file:///etc/passwd'],
    ['vbscript', 'vbscript:msgbox(1)'],
    ['mixed-case JavaScript', 'JavaScript:alert(1)'],
    ['upper-case JAVASCRIPT', 'JAVASCRIPT:alert(1)'],
    ['leading-whitespace javascript', '   javascript:alert(1)'],
    ['leading-tab javascript', '\tjavascript:alert(1)'],
    ['leading-newline javascript', '\njavascript:alert(1)'],
  ])('blocks %s: protocol and does not navigate', (_label, to) => {
    windowNavigate(to);
    expect(hrefSetter).not.toHaveBeenCalled();
    expect(eventSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('blocks javascript: URLs that the URL parser normalizes via the base URL', () => {
    windowNavigate('javascript:alert(location.origin)//');
    expect(hrefSetter).not.toHaveBeenCalled();
    expect(eventSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['scheme-relative //host', '//evil.example/path'],
    ['scheme-relative ///host', '///evil.example/path'],
    ['backslash \\\\host', '\\\\evil.example\\path'],
    ['mixed /\\host', '/\\evil.example/path'],
    ['mixed \\/host', '\\/evil.example/path'],
    ['leading-whitespace scheme-relative', '   //evil.example/path'],
    ['leading-tab scheme-relative', '\t//evil.example/path'],
    // Control characters the URL parser strips but `trim()` does not: each still resolves
    // scheme-relative against the base origin, so the guard must normalize before testing.
    ['interior-tab scheme-relative', '/\t/evil.example/path'],
    ['interior-newline scheme-relative', '/\n/evil.example/path'],
    ['interior-cr scheme-relative', '/\r/evil.example/path'],
    ['interior-tab backslash', '\\\t\\evil.example/path'],
    ['leading-null scheme-relative', '\x00//evil.example/path'],
    ['leading-c0-controls scheme-relative', '\x01\x02//evil.example/path'],
  ])('blocks %s and does not navigate', (_label, to) => {
    windowNavigate(to);
    expect(hrefSetter).not.toHaveBeenCalled();
    expect(eventSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('still rejects scheme-relative URLs when an extended allowlist is supplied', () => {
    windowNavigate('//evil.example/path', {
      allowedProtocols: [...ALLOWED_PROTOCOLS, 'slack:'],
    });
    expect(hrefSetter).not.toHaveBeenCalled();
    expect(eventSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('honors a caller-supplied extended allowlist for custom protocols', () => {
    windowNavigate('slack://channel/123', {
      allowedProtocols: [...ALLOWED_PROTOCOLS, 'slack:'],
    });
    expect(hrefSetter).toHaveBeenCalledTimes(1);
    expect(hrefSetter).toHaveBeenCalledWith('slack://channel/123');
    expect(eventSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('still rejects disallowed protocols when an extended allowlist is supplied', () => {
    windowNavigate('javascript:alert(1)', {
      allowedProtocols: [...ALLOWED_PROTOCOLS, 'slack:'],
    });
    expect(hrefSetter).not.toHaveBeenCalled();
    expect(eventSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
