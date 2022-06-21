import { renderHook } from '@clerk/shared/testUtils';

const mockUseOptions = jest.fn();

import { useSupportEmail } from './useSupportEmail';

jest.mock('ui/contexts', () => {
  return {
    useCoreClerk: () => {
      return {
        frontendApi: 'clerk.clerk.dev',
      };
    },
    useOptions: mockUseOptions,
  };
});

describe('useSupportEmail', () => {
  test('should use custom email when provided', () => {
    mockUseOptions.mockImplementationOnce(() => ({ supportEmail: 'test@email.com' }));
    const { result } = renderHook(() => useSupportEmail());

    expect(result.current).toBe('test@email.com');
  });

  test('should fallback to default when supportEmail is not provided in options', () => {
    mockUseOptions.mockImplementationOnce(() => ({ supportEmail: undefined }));
    const { result } = renderHook(() => useSupportEmail());

    expect(result.current).toBe('support@clerk.dev');
  });
});
