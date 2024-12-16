/* eslint-disable no-global-assign */
import { isSpaMode } from '../assert';

describe('isSpaMode', () => {
  const currentWindow = window;

  afterEach(() => {
    window = currentWindow;
  });

  it('should return undefined when window is undefined', () => {
    expect(isSpaMode()).toBeUndefined();
  });

  it('should return undefined when window.__reactRouterContext is undefined', () => {
    // @ts-expect-error - Tests
    window = { __reactRouterContext: undefined };
    expect(isSpaMode()).toBeUndefined();
  });

  it('should return undefined when window.__reactRouterContext.isSpaMode is undefined', () => {
    // @ts-expect-error - Tests
    window = { __reactRouterContext: { isSpaMode: undefined } };
    expect(isSpaMode()).toBeUndefined();
  });

  it('should return true when window.__reactRouterContext.isSpaMode is true', () => {
    // @ts-expect-error - Tests
    window = { __reactRouterContext: { isSpaMode: true } };
    expect(isSpaMode()).toBe(true);
  });

  it('should return false when window.__reactRouterContext.isSpaMode is false', () => {
    // @ts-expect-error - Tests
    window = { __reactRouterContext: { isSpaMode: false } };
    expect(isSpaMode()).toBe(false);
  });
});
