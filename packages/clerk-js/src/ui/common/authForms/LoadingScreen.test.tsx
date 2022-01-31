import React from 'react';
import { renderJSON } from '@clerk/shared/testUtils';
import { LoadingScreen } from './LoadingScreen';

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

describe('<LoadingScreen/>', () => {
  it('renders the loading page', async () => {
    const tree = renderJSON(<LoadingScreen />);
    expect(tree).toMatchSnapshot();
  });
});
