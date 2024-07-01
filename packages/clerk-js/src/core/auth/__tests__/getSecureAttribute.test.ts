import { getSecureAttribute } from '../getSecureAttribute';

const oldWindowLocation = window.location;
const oldWindowSafari = (window as any).safari;
const oldWindowSecureContext = window.isSecureContext;

describe('getSecureAttribute', () => {
  afterAll(() => {
    Object.defineProperty(global.window, 'location', {
      value: oldWindowLocation,
    });
    Object.defineProperty(global.window, 'safari', {
      value: oldWindowSafari,
    });
    Object.defineProperty(global.window, 'isSecureContext', {
      value: oldWindowSecureContext,
    });
  });

  it('returns true if the protocol is https', () => {
    const mockWindowLocation = new URL('https://www.clerk.com') as any as Window['location'];
    Object.defineProperty(global.window, 'location', { value: mockWindowLocation, configurable: true });
    expect(getSecureAttribute('None')).toBe(true);
  });

  it('returns false if the protocol is not https and the browser is Safari', () => {
    const mockWindowLocation = new URL('http://www.clerk.com') as any as Window['location'];
    Object.defineProperty(global.window, 'location', { value: mockWindowLocation, configurable: true });
    Object.defineProperty(global.window, 'safari', { value: { dummyValue: true }, configurable: true });
    Object.defineProperty(global.window, 'isSecureContext', { value: undefined, configurable: true });
    expect(getSecureAttribute('None')).toBe(false);
  });

  it('returns true if isSecureContext is true', () => {
    const mockWindowLocation = new URL('http://www.clerk.com') as any as Window['location'];
    Object.defineProperty(global.window, 'location', { value: mockWindowLocation, configurable: true });
    Object.defineProperty(global.window, 'safari', { value: undefined, configurable: true });
    Object.defineProperty(global.window, 'isSecureContext', { value: true, configurable: true });
    expect(getSecureAttribute('None')).toBe(true);
  });

  it('returns false if isSecureContext is false', () => {
    const mockWindowLocation = new URL('http://www.clerk.com') as any as Window['location'];
    Object.defineProperty(global.window, 'location', { value: mockWindowLocation, configurable: true });
    Object.defineProperty(global.window, 'safari', { value: undefined, configurable: true });
    Object.defineProperty(global.window, 'isSecureContext', { value: false, configurable: true });
    expect(getSecureAttribute('None')).toBe(false);
  });

  it('returns true if the protocol is http and the hostname is localhost and sameSite is None', () => {
    const mockWindowLocation = new URL('http://localhost') as any as Window['location'];
    Object.defineProperty(global.window, 'location', { value: mockWindowLocation, configurable: true });
    Object.defineProperty(global.window, 'safari', { value: undefined, configurable: true });
    Object.defineProperty(global.window, 'isSecureContext', { value: undefined, configurable: true });
    expect(getSecureAttribute('None')).toBe(true);
  });

  it('returns false if the protocol is http and the hostname is localhost and sameSite is not None', () => {
    const mockWindowLocation = new URL('http://localhost') as any as Window['location'];
    Object.defineProperty(global.window, 'location', { value: mockWindowLocation, configurable: true });
    Object.defineProperty(global.window, 'safari', { value: undefined, configurable: true });
    Object.defineProperty(global.window, 'isSecureContext', { value: undefined, configurable: true });
    expect(getSecureAttribute('Lax')).toBe(false);
  });

  it('returns false if the protocol is http and the hostname is not localhost', () => {
    const mockWindowLocation = new URL('http://www.clerk.com') as any as Window['location'];
    Object.defineProperty(global.window, 'location', { value: mockWindowLocation, configurable: true });
    Object.defineProperty(global.window, 'safari', { value: undefined, configurable: true });
    Object.defineProperty(global.window, 'isSecureContext', { value: undefined, configurable: true });
    expect(getSecureAttribute('None')).toBe(false);
  });
});
