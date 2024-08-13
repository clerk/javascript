import { renderHook } from '@testing-library/react';

import { ClerkElementsError } from '~/internals/errors';
import * as internalFormHooks from '~/internals/machines/form/form.context';

import { useGlobalErrors } from '../use-global-errors';

describe('useGlobalErrors', () => {
  it('should correctly output errors (no errors)', () => {
    const returnValue: ClerkElementsError[] = [];

    jest.spyOn(internalFormHooks, 'useFormSelector').mockReturnValue([]);

    const { result } = renderHook(() => useGlobalErrors());

    expect(result.current).toEqual({ errors: returnValue });
  });

  it('should correctly output errors (has errors)', () => {
    const returnValue = [new ClerkElementsError('email-link-verification-failed', 'Email verification failed')];

    jest.spyOn(internalFormHooks, 'useFormSelector').mockReturnValue(returnValue);

    const { result } = renderHook(() => useGlobalErrors());

    expect(result.current).toEqual({ errors: returnValue });
  });
});
