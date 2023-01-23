import { render, screen } from '@clerk/shared/testUtils';
import type { EnvironmentResource } from '@clerk/types';
import React from 'react';

import type { AuthConfig, DisplayConfig } from '../../../core/resources';
import { CoreSessionContext, useEnvironment } from '../../contexts';
import { withRedirectToHome } from '../withRedirectToHome';

const mockNavigate = jest.fn();
jest.mock('ui/hooks', () => ({
  useNavigate: () => ({ navigate: mockNavigate }),
}));

jest.mock('ui/contexts', () => ({
  ...jest.requireActual('ui/contexts'),
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
        const Component = withRedirectToHome(Tester, 'singleSession');
        render(
          <CoreSessionContext.Provider value={{ value: { id: 'sess_id' } as any }}>
            <Component />
          </CoreSessionContext.Provider>,
        );
        expect(mockNavigate).toHaveBeenNthCalledWith(1, 'http://my-home.com');
        expect(screen.queryByText('Tester')).not.toBeInTheDocument();
      });
    });

    describe('and the instance is not in single session mode', () => {
      beforeEach(() => {
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
        const Component = withRedirectToHome(Tester, 'singleSession');
        render(
          <CoreSessionContext.Provider value={{ value: { id: 'sess_id' } as any }}>
            <Component />
          </CoreSessionContext.Provider>,
        );
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(screen.queryByText('Tester')).toBeInTheDocument();
      });
    });
  });

  describe('when there is no session', () => {
    beforeEach(() => {
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
      const Component = withRedirectToHome(Tester, 'singleSession');
      render(
        <CoreSessionContext.Provider value={{ value: undefined }}>
          <Component />
        </CoreSessionContext.Provider>,
      );
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.queryByText('Tester')).toBeInTheDocument();
    });
  });
});
