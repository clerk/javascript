import { render, renderJSON, screen, userEvent } from '@clerk/shared/testUtils';
import { PhoneNumberResource } from '@clerk/types';
import { ClerkAPIResponseError } from 'core/resources/Error';
import React from 'react';
import { useCoreUser } from 'ui/contexts/CoreUserContext';

import { PhoneDetail } from './PhoneDetail';

const mockNavigate = jest.fn();
jest.mock('ui/hooks', () => ({
  useNavigate: () => {
    return {
      navigate: mockNavigate,
    };
  },
}));

jest.mock('ui/router/RouteContext', () => {
  return {
    useRouter: () => {
      return {
        params: { phone_number_id: '1' },
        resolve: () => {
          return {
            toURL: {
              href: 'http://www.ssddd.com',
            },
          };
        },
      };
    },
  };
});

jest.mock('ui/contexts/CoreUserContext', () => {
  return {
    useCoreUser: jest.fn(),
  };
});

describe('<PhoneDetail/>', () => {
  it('renders the list', async () => {
    (useCoreUser as jest.Mock).mockImplementation(() => {
      return {
        primaryEmailAddressId: '1',
        phoneNumbers: [
          {
            id: '1',
            phoneNumber: '1234',
            verification: { status: 'verified' },
            linkedTo: [],
          } as any as PhoneNumberResource,
        ],
      };
    });
    const tree = renderJSON(<PhoneDetail />);
    expect(tree).toMatchSnapshot();
  });

  fit('displays verification errors', async () => {
    (useCoreUser as jest.Mock).mockImplementation(() => {
      return {
        primaryEmailAddressId: '1',
        phoneNumbers: [
          {
            id: '1',
            phoneNumber: 'clerk1@clerk.dev',
            verification: { status: 'unverified' },
            linkedTo: [],
            prepareVerification: async () => {
              return null;
            },
            attemptVerification: async ({ code }: { code: string }) => {
              if (code === '999999') {
                throw new ClerkAPIResponseError('the-error', {
                  data: [
                    {
                      code: 'the-code',
                      message: 'the-short-message',
                      long_message: 'the-long-error-message',
                    },
                  ],
                  status: 422,
                });
              }
              return null;
            },
          } as any as PhoneNumberResource,
        ],
      };
    });
    render(<PhoneDetail />);
    // Type a verification code that will throw an error,
    // in this case '999999'.
    await userEvent.type(screen.getByLabelText('Enter verification code. Digit 1'), '9');
    await userEvent.type(screen.getByLabelText('Digit 2'), '9');
    await userEvent.type(screen.getByLabelText('Digit 3'), '9');
    await userEvent.type(screen.getByLabelText('Digit 4'), '9');
    await userEvent.type(screen.getByLabelText('Digit 5'), '9');
    await userEvent.type(screen.getByLabelText('Digit 6'), '9');

    expect(await screen.findByText('the-long-error-message')).toBeInTheDocument();
  });
});
