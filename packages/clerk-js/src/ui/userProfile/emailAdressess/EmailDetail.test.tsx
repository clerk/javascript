import { render, renderJSON, screen, userEvent } from '@clerk/shared/testUtils';
import { EmailAddressResource, EnvironmentResource, UserSettingsResource } from '@clerk/types';
import { ClerkAPIResponseError } from 'core/resources/Error';
import React from 'react';
import { PartialDeep } from 'type-fest';

import { EmailDetail } from './EmailDetail';

const mockNavigate = jest.fn();
const mockUseCoreUser = jest.fn();
let mockFirstFactors = {} as PartialDeep<UserSettingsResource>;

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
    useEnvironment: jest.fn(
      () =>
        ({
          userSettings: mockFirstFactors,
        } as PartialDeep<EnvironmentResource>),
    ),
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
    mockFirstFactors = {
      attributes: {
        email_address: {
          used_for_first_factor: true,
          first_factors: ['email_code'],
        },
      },
    };
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
          } as any as EmailAddressResource,
        ],
      };
    });
    render(<EmailDetail />);
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
