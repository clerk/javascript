import type { LoadedClerk, SignUpResource } from '@clerk/types';

import { handleCombinedFlowTransfer, hasOptionalFields } from '../handleCombinedFlowTransfer';

// eslint-disable-next-line no-var -- Jest hoists mock calls to the top of the file, so var is needed.
var mockCompleteSignUpFlow: jest.Mock;
jest.mock('../lazy-sign-up', () => {
  mockCompleteSignUpFlow = jest.fn();
  return {
    lazyCompleteSignUpFlow: () => {
      return Promise.resolve(mockCompleteSignUpFlow);
    },
  };
});

const mockNavigate = jest.fn();
const mockHandleError = jest.fn();

describe('handleCombinedFlowTransfer', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should call completeSignUpFlow', async () => {
    const mockClerk = {
      client: {
        signUp: {
          create: jest.fn().mockResolvedValue({}),
          optionalFields: [],
        },
      },
    };

    await handleCombinedFlowTransfer({
      identifierAttribute: 'emailAddress',
      identifierValue: 'test@test.com',
      signUpMode: 'public',
      navigate: mockNavigate,
      handleError: mockHandleError,
      clerk: mockClerk as unknown as LoadedClerk,
      afterSignUpUrl: 'https://test.com',
      passwordEnabled: false,
      navigateOnSetActive: jest.fn(),
    });

    expect(mockCompleteSignUpFlow).toHaveBeenCalled();
  });

  it('should call completeSignUpFlow with phone number if phone number is optional field.', async () => {
    const mockClerk = {
      client: {
        signUp: {
          create: jest.fn().mockImplementation((...args) => Promise.resolve(args)),
          optionalFields: ['phone_number'],
        },
      },
    };

    await handleCombinedFlowTransfer({
      identifierAttribute: 'phoneNumber',
      identifierValue: '+1234567890',
      signUpMode: 'public',
      navigate: mockNavigate,
      handleError: mockHandleError,
      clerk: mockClerk as unknown as LoadedClerk,
      afterSignUpUrl: 'https://test.com',
      passwordEnabled: false,
      navigateOnSetActive: jest.fn(),
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockClerk.client.signUp.create).toHaveBeenCalled();
    expect(mockCompleteSignUpFlow).toHaveBeenCalled();
  });

  it('should call navigate if password is enabled', async () => {
    const mockClerk = {
      client: {
        signUp: {
          create: jest.fn().mockImplementation((...args) => Promise.resolve(args)),
          optionalFields: ['password'],
        },
      },
    };

    await handleCombinedFlowTransfer({
      identifierAttribute: 'phoneNumber',
      identifierValue: '+1234567890',
      signUpMode: 'public',
      navigate: mockNavigate,
      handleError: mockHandleError,
      clerk: mockClerk as unknown as LoadedClerk,
      afterSignUpUrl: 'https://test.com',
      passwordEnabled: true,
      navigateOnSetActive: jest.fn(),
    });

    expect(mockNavigate).toHaveBeenCalled();
    expect(mockClerk.client.signUp.create).not.toHaveBeenCalled();
    expect(mockCompleteSignUpFlow).not.toHaveBeenCalled();
  });

  it('should call navigate if identifier is username', async () => {
    const mockClerk = {
      client: {
        signUp: {
          create: jest.fn().mockImplementation((...args) => Promise.resolve(args)),
          optionalFields: [],
        },
      },
    };

    await handleCombinedFlowTransfer({
      identifierAttribute: 'username',
      identifierValue: 'test',
      signUpMode: 'public',
      navigate: mockNavigate,
      handleError: mockHandleError,
      clerk: mockClerk as unknown as LoadedClerk,
      afterSignUpUrl: 'https://test.com',
      passwordEnabled: false,
      navigateOnSetActive: jest.fn(),
    });

    expect(mockNavigate).toHaveBeenCalled();
    expect(mockClerk.client.signUp.create).not.toHaveBeenCalled();
    expect(mockCompleteSignUpFlow).not.toHaveBeenCalled();
  });

  it('should call navigate if first_name is optional', async () => {
    const mockClerk = {
      client: {
        signUp: {
          create: jest.fn().mockImplementation((...args) => Promise.resolve(args)),
          optionalFields: ['first_name'],
        },
      },
    };

    await handleCombinedFlowTransfer({
      identifierAttribute: 'emailAddress',
      identifierValue: 'test@test.com',
      signUpMode: 'public',
      navigate: mockNavigate,
      handleError: mockHandleError,
      clerk: mockClerk as unknown as LoadedClerk,
      afterSignUpUrl: 'https://test.com',
      passwordEnabled: false,
      navigateOnSetActive: jest.fn(),
    });

    expect(mockNavigate).toHaveBeenCalled();
    expect(mockClerk.client.signUp.create).not.toHaveBeenCalled();
    expect(mockCompleteSignUpFlow).not.toHaveBeenCalled();
  });
});

describe('hasOptionalFields', () => {
  it('should return true if there are optional fields', () => {
    const signUp = {
      optionalFields: ['legal_accepted'],
    } as unknown as SignUpResource;

    expect(hasOptionalFields(signUp, 'phoneNumber')).toBe(true);
  });

  it('should return false if the identifier attribute is phoneNumber and the optional field is phone_number', () => {
    const signUp = {
      optionalFields: ['phone_number'],
    } as unknown as SignUpResource;

    expect(hasOptionalFields(signUp, 'phoneNumber')).toBe(false);
  });

  it('should return false if there are no optional fields', () => {
    const signUp = {
      optionalFields: [],
    } as unknown as SignUpResource;

    expect(hasOptionalFields(signUp, 'phoneNumber')).toBe(false);
  });
});
