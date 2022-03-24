import { render, screen } from '@clerk/shared/testUtils';
import { EnvironmentResource } from '@clerk/types';
import { AuthConfig, DisplayConfig } from 'core/resources';
import React from 'react';
import { useCoreSession, useEnvironment } from 'ui/contexts';

import { withRedirectToHome } from './withRedirectToHome';

const mockNavigate = jest.fn();
jest.mock('ui/hooks', () => ({
  useNavigate: () => ({ navigate: mockNavigate }),
}));

jest.mock('ui/contexts', () => ({
  useCoreSession: jest.fn(),
  useEnvironment: jest.fn(),
}));

const Tester = () => <div>Tester</div>;

describe('withRedirectToHome(Component)', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  describe('when there is a session', () => {
    describe('and the instance is in single session mode', () => {
      beforeEach(() => {
        (useCoreSession as jest.Mock).mockImplementation(() => ({
          id: 'sess_id',
        }));

        (useEnvironment as jest.Mock).mockImplementation(
          () =>
            ({
              displayConfig: {
                homeUrl: 'http://my-home.com',
              } as Partial<DisplayConfig>,
              authConfig: {
                singleSessionMode: true,
              } as Partial<AuthConfig>,
            } as Partial<EnvironmentResource>),
        );
      });

      it('navigates to home_url', () => {
        const Component = withRedirectToHome(Tester);
        render(<Component />);
        expect(mockNavigate).toHaveBeenNthCalledWith(1, 'http://my-home.com');
        expect(screen.queryByText('Tester')).not.toBeInTheDocument();
      });
    });

    describe('and the instance is not in single session mode', () => {
      beforeEach(() => {
        (useCoreSession as jest.Mock).mockImplementation(() => ({
          id: 'sess_id',
        }));

        (useEnvironment as jest.Mock).mockImplementation(
          () =>
            ({
              displayConfig: {
                homeUrl: 'http://my-home.com',
              } as Partial<DisplayConfig>,
              authConfig: {
                singleSessionMode: false,
              } as Partial<AuthConfig>,
            } as Partial<EnvironmentResource>),
        );
      });

      it('renders the wrapped component', () => {
        const Component = withRedirectToHome(Tester);
        render(<Component />);
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(screen.queryByText('Tester')).toBeInTheDocument();
      });
    });
  });

  describe('when there is no session', () => {
    beforeEach(() => {
      (useCoreSession as jest.Mock).mockImplementation(() => undefined);

      (useEnvironment as jest.Mock).mockImplementation(
        () =>
          ({
            displayConfig: {
              homeUrl: 'http://my-home.com',
            } as Partial<DisplayConfig>,
            authConfig: {
              singleSessionMode: true,
            } as Partial<AuthConfig>,
          } as Partial<EnvironmentResource>),
      );
    });

    it('renders the wrapped component', () => {
      const Component = withRedirectToHome(Tester);
      render(<Component />);
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.queryByText('Tester')).toBeInTheDocument();
    });
  });
});
