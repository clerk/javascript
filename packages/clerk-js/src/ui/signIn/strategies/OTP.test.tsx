import { noop, render, renderJSON, waitFor } from '@clerk/shared/testUtils';
import { SignInFactor } from '@clerk/types';
import React from 'react';
import { FieldState } from 'ui/common';

import { OTP } from './OTP';

jest.mock('ui/contexts', () => {
  return {
    useCoreSignIn: jest.fn(),
  };
});

describe('<OTP/>', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const code = {
    name: 'code',
    value: '123456',
    setValue: noop,
    error: undefined,
    setError: noop,
  } as FieldState<string>;

  const factor = {
    strategy: 'phone_code',
    safe_identifier: 'jdoe@example.com',
  } as SignInFactor;

  it('renders the OTP form component', async () => {
    const tree = renderJSON(
      <OTP verifyCode={(verify) => verify()} factor={factor} code={code} />
    );
    await jest.runAllTimers();
    expect(tree).toMatchSnapshot();
  });

  it('renders the OTP form, enters a password verifies the code', async () => {
    const mockVerify = jest.fn((verify) => verify());

    render(<OTP verifyCode={mockVerify} factor={factor} code={code} />);

    await waitFor(() => {
      expect(mockVerify).toHaveBeenCalledTimes(1);
      // TODO: Check for the value
      // expect(mockSubmit).toHaveBeenCalledWith({})
    });
  });
});
