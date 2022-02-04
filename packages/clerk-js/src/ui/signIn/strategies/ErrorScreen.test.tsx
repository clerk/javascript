import { renderJSON } from '@clerk/shared/testUtils';
import React from 'react';

import { ErrorScreen } from './ErrorScreen';

jest.mock('ui/contexts/EnvironmentContext', () => {
  return {
    useEnvironment: jest.fn(() => ({
      displayConfig: {
        theme: {
          general: {
            color: '#000000',
          },
        },
        preferred_sign_in_strategy: 'otp',
      },
    })),
  };
});

jest.mock('ui/router/RouteContext');

describe('<Error/>', () => {
  it('renders the fallback error page', async () => {
    const tree = renderJSON(<ErrorScreen />);
    expect(tree).toMatchSnapshot();
  });
});
