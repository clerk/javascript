import { EmailAddressResource } from '@clerk/types';
import React from 'react';
import { screen, render, userEvent, renderJSON } from '@clerk/shared/testUtils';
import { ClerkAPIResponseError } from 'core/resources/Error';
import { EmailDetail } from './EmailDetail';
import { SignInStrategyName } from '@clerk/types';

const mockNavigate = jest.fn();
const mockUseCoreUser = jest.fn();
let mockFirstFactors = [] as SignInStrategyName[];

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
        params: { email_address_id: '1' },
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

jest.mock('ui/contexts', () => {
  return {
    useCoreUser: () => mockUseCoreUser(),
    useEnvironment: jest.fn(() => ({
      authConfig: {
        firstFactors: mockFirstFactors,
        emailAddressVerificationStrategies: mockFirstFactors,
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

describe('<EmailDetail/>', () => {
  it('renders EmailDetail', async () => {
    mockUseCoreUser.mockImplementation(() => {
      return {
        primaryEmailAddressId: '1',
        emailAddresses: [
          {
            id: '1',
            email_address: 'clerk1@clerk.dev',
            verification: { status: 'verified' },
            linkedTo: [],
            attemptVerificationWithMagicLink: jest.fn(),
          },
        ],
      };
    });

    const tree = renderJSON(<EmailDetail />);
    expect(tree).toMatchSnapshot();
  });

  it('displays verification errors', async () => {
    mockFirstFactors = ['email_code'];
    mockUseCoreUser.mockImplementation(() => {
      return {
        primaryEmailAddressId: '1',
        emailAddresses: [
          {
            id: '1',
            email_address: 'clerk1@clerk.dev',
            verification: { status: 'unverified' },
            linkedTo: [],
            attemptVerificationWithMagicLink: jest.fn(),
            prepareVerification: async () => {
              return null;
            },
            attemptVerification: async (code: string) => {
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
          } as any as EmailAddressResource,
        ],
      };
    });
    render(<EmailDetail />);
    // Type a verification code that will throw an error,
    // in this case '999999'.
    userEvent.type(
      screen.getByLabelText('Enter verification code. Digit 1'),
      '9'
    );
    userEvent.type(screen.getByLabelText('Digit 2'), '9');
    userEvent.type(screen.getByLabelText('Digit 3'), '9');
    userEvent.type(screen.getByLabelText('Digit 4'), '9');
    userEvent.type(screen.getByLabelText('Digit 5'), '9');
    userEvent.type(screen.getByLabelText('Digit 6'), '9');

    expect(
      await screen.findByText('the-long-error-message')
    ).toBeInTheDocument();
  });
});
