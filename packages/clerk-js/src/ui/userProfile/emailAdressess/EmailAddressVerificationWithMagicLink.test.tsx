import { render,renderJSON } from '@clerk/shared/testUtils';
import { EmailAddressResource } from '@clerk/types';
import { waitFor } from '@testing-library/dom';
import React from 'react';

import { EmailAddressVerificationWithMagicLink } from './EmailAddressVerificationWithMagicLink';

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

describe('<EmailAddressVerificationWithMagicLink/>', function () {
  it('renders the <EmailAddressVerificationWithMagicLink/> component', function () {
    const email = {
      id: '1',
      emailAddress: 'boss@clerk.dev',
      createMagicLinkFlow: jest.fn(() => ({
        startMagicLinkFlow: () =>
          Promise.resolve({
            status: 'verified',
          }),
        cancelMagicLinkFlow: () => {
          return;
        },
      })),
    } as any as EmailAddressResource;

    const tree = renderJSON(
      <EmailAddressVerificationWithMagicLink email={email} />
    );
    expect(tree).toMatchSnapshot();
  });

  it('calls onVerificationComplete when the email address gets verified', async function () {
    const mockStartMagicLinkFlow = jest.fn(() =>
      Promise.resolve({
        status: 'verified',
      })
    );
    const mockOnVerificationCompleteHandler = jest.fn();
    const email = {
      id: '1',
      emailAddress: 'boss@clerk.dev',
      createMagicLinkFlow: () => ({
        startMagicLinkFlow: mockStartMagicLinkFlow,
        cancelMagicLinkFlow: () => {
          return;
        },
      }),
    } as any as EmailAddressResource;

    render(
      <EmailAddressVerificationWithMagicLink
        email={email}
        onVerificationComplete={mockOnVerificationCompleteHandler}
      />
    );

    await waitFor(() => {
      expect(mockOnVerificationCompleteHandler).toHaveBeenCalled();
    });
  });

  it('calls onError when the verification fails with an error', async function () {
    const mockStartMagicLinkFlow = jest.fn(() => Promise.reject('error'));
    const mockOnErrorHandler = jest.fn();
    const email = {
      id: '1',
      emailAddress: 'boss@clerk.dev',
      createMagicLinkFlow: () => ({
        startMagicLinkFlow: mockStartMagicLinkFlow,
        cancelMagicLinkFlow: () => {
          return;
        },
      }),
    } as any as EmailAddressResource;

    render(
      <EmailAddressVerificationWithMagicLink
        email={email}
        onError={mockOnErrorHandler}
      />
    );

    await waitFor(() => {
      expect(mockOnErrorHandler).toHaveBeenCalledWith('error');
    });
  });
});
