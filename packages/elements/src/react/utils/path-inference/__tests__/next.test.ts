import { renderHook } from '@testing-library/react';
import { useRouter } from 'next/compat/router';
import { useParams, usePathname } from 'next/navigation';

import { usePathnameWithoutCatchAll } from '../next';

jest.mock('next/compat/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useParams: jest.fn(),
}));

describe('usePathnameWithoutCatchAll', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should work with pages router', () => {
    const pathname = '/user/123/profile/[[...rest]]/page';
    const expectedPath = '/user/123/profile';

    (useRouter as jest.Mock).mockImplementation(() => ({
      push: jest.fn(),
      pathname: pathname,
      route: '/',
      asPath: '/',
      query: '',
    }));

    const { result } = renderHook(() => usePathnameWithoutCatchAll());

    expect(result.current).toBe(expectedPath);
  });

  it('should work with app router', () => {
    const pathname = '/user/123/profile/security';
    const expectedPath = '/user/123/profile';

    (useRouter as jest.Mock).mockImplementation(() => null);
    (usePathname as jest.Mock).mockReturnValue(pathname);
    (useParams as jest.Mock).mockReturnValue({ id: '123', rest: ['security'] });

    const { result } = renderHook(() => usePathnameWithoutCatchAll());

    expect(result.current).toBe(expectedPath);
  });

  it('should work with multiple catch all params (app router)', () => {
    const pathname = '/user/123/profile/security/otp';
    const expectedPath = '/user/123/profile';

    (useRouter as jest.Mock).mockImplementation(() => null);
    (usePathname as jest.Mock).mockReturnValue(pathname);
    (useParams as jest.Mock).mockReturnValue({ id: '123', rest: ['security', 'otp'] });

    const { result } = renderHook(() => usePathnameWithoutCatchAll());

    expect(result.current).toBe(expectedPath);
  });
});
