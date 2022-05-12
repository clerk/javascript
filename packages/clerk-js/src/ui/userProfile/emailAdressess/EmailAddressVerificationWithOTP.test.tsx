import { render, renderJSON, screen, userEvent } from '@clerk/shared/testUtils';
import { EmailAddressResource } from '@clerk/types';
import { waitFor } from '@testing-library/dom';
import React from 'react';

import { EmailAddressVerificationWithOTP } from './EmailAddressVerificationWithOTP';

jest.mock('ui/contexts', () => {
  return {
    useEnvironment: jest.fn(() => ({
      authConfig: {
        firstFactors: ['email_link'],
      },
    })),
    useUserProfileContext: jest.fn(() => {
      return {
        routing: 'path',
        path: '/user',
      };
    }),
  };
});

describe('<EmailAddressVerificationWithOTP/>', function () {
  it('renders the <EmailAddressVerificationWithOTP/> component', function () {
    const email = {
      id: '1',
      emailAddress: 'boss@clerk.dev',
      prepareVerification: jest.fn(() => Promise.resolve()),
      attemptVerification: jest.fn(() => Promise.resolve()),
    } as any as EmailAddressResource;

    const tree = renderJSON(<EmailAddressVerificationWithOTP email={email} />);
    expect(tree).toMatchSnapshot();
  });

  it('calls onVerificationComplete when the email address gets verified', async function () {
    const mockOnVerificationCompleteHandler = jest.fn();
    const email = {
      id: '1',
      emailAddress: 'boss@clerk.dev',
      prepareVerification: jest.fn(() => Promise.resolve()),
      attemptVerification: jest.fn(() => Promise.resolve()),
    } as any as EmailAddressResource;

    render(
      <EmailAddressVerificationWithOTP
        email={email}
        onVerificationComplete={mockOnVerificationCompleteHandler}
      />,
    );

    await userEvent.type(screen.getByLabelText('Enter verification code. Digit 1'), '1');
    await userEvent.type(screen.getByLabelText('Digit 2'), '2');
    await userEvent.type(screen.getByLabelText('Digit 3'), '3');
    await userEvent.type(screen.getByLabelText('Digit 4'), '4');
    await userEvent.type(screen.getByLabelText('Digit 5'), '5');
    await userEvent.type(screen.getByLabelText('Digit 6'), '6');

    await waitFor(() => {
      expect(mockOnVerificationCompleteHandler).toHaveBeenCalled();
    });
  });

  it('calls onError when the verification fails with an error', async function () {
    const mockOnErrorHandler = jest.fn();
    const email = {
      id: '1',
      emailAddress: 'boss@clerk.dev',
      prepareVerification: jest.fn(() => Promise.reject('error')),
      attemptVerification: jest.fn(() => Promise.resolve()),
    } as any as EmailAddressResource;

    render(
      <EmailAddressVerificationWithOTP
        email={email}
        onError={mockOnErrorHandler}
      />,
    );

    await waitFor(() => {
      expect(mockOnErrorHandler).toHaveBeenCalledWith('error');
    });
  });
});
