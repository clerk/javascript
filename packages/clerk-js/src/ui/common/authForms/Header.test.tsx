import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';

import { Header } from './Header';

jest.mock('ui/contexts/EnvironmentContext', () => {
  return {
    useEnvironment: jest.fn(() => ({
      displayConfig: {
        theme: {
          general: {
            color: '#000000',
          },
        },
      },
    })),
  };
});

jest.mock('ui/router/RouteContext');

describe('<Header/>', () => {
  it('renders the header component', () => {
    const tree = renderJSON(<Header error="Boom" showBack welcomeName="Joe" />);
    expect(tree).toMatchSnapshot();
  });
});
