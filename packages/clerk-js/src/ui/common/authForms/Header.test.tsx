import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';
import { Alert } from 'ui/common/alert';

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
  it('renders a header component with everything enabled', () => {
    const tree = renderJSON(
      <Header
        alert={<Alert type='error'>boom</Alert>}
        showBack
        showLogo
        welcomeName='Joe'
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('renders a plain header', () => {
    const tree = renderJSON(<Header />);

    expect(tree).toMatchSnapshot();
  });
});
