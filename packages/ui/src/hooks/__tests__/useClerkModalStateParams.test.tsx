import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useClerkModalStateParams } from '../useClerkModalStateParams';

const setModalState = (componentName: string, path?: string) => {
  const state = btoa(JSON.stringify({ componentName, path, startPath: '/user-verification' }));
  window.history.replaceState({}, '', `/?__clerk_modal_state=${encodeURIComponent(state)}`);
};

describe('useClerkModalStateParams', () => {
  afterEach(() => window.history.replaceState({}, '', '/'));

  it.each(['', '/', '/factor-two', '/verify/other', undefined])(
    'ignores reverification modal state for path %s',
    path => {
      setModalState('UserVerification', path);
      const { result } = renderHook(useClerkModalStateParams);
      expect(result.current.decodedRedirectParams).toBeNull();
      expect(result.current.urlStateParam.path).toBe('');
    },
  );

  it('restores the reverification callback route', () => {
    setModalState('UserVerification', '/verify');
    const { result } = renderHook(useClerkModalStateParams);
    expect(result.current.decodedRedirectParams?.componentName).toBe('UserVerification');
    expect(result.current.urlStateParam.path).toBe('/verify');
  });

  it('preserves other modal routes', () => {
    setModalState('SignIn', '/factor-one');
    const { result } = renderHook(useClerkModalStateParams);
    expect(result.current.decodedRedirectParams?.componentName).toBe('SignIn');
    expect(result.current.urlStateParam.path).toBe('/factor-one');
  });
});
