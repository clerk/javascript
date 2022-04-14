import { render, screen } from '@clerk/shared/testUtils';
import { EnvironmentResource, UserResource } from '@clerk/types';
import * as React from 'react';
import { PartialDeep } from 'type-fest';
import { useEnvironment } from 'ui/contexts';
import { ChangePassword } from 'ui/userProfile/security/ChangePassword';

jest.mock('ui/hooks', () => ({
  useNavigate: () => ({ navigate: jest.fn() }),
}));

jest.mock('ui/router/RouteContext');

jest.mock('ui/contexts', () => {
  return {
    useCoreUser: (): Partial<UserResource> => ({
      passwordEnabled: true,
    }),
    useEnvironment: jest.fn(),
  };
});

describe('<ChangePassword/>', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the ChangePassword page with showing remove password cta', async () => {
    (useEnvironment as jest.Mock<PartialDeep<EnvironmentResource>>).mockImplementation(() => ({
      userSettings: {
        attributes: {
          password: {
            enabled: true,
          },
        },
      },
    }));

    render(<ChangePassword />);
    expect(screen.getByText('Remove password')).toBeInTheDocument();
  });

  it('renders the ChangePassword page without showing remove password cta', async () => {
    (useEnvironment as jest.Mock<PartialDeep<EnvironmentResource>>).mockImplementation(() => ({
      userSettings: {
        attributes: {
          password: {
            enabled: false,
          },
        },
      },
    }));

    render(<ChangePassword />);
    expect(screen.getByText('Remove password')).toBeInTheDocument();
  });
});
