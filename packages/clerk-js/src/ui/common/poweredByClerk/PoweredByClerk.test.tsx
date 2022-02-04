import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';

import { PoweredByClerk } from './PoweredByClerk';

jest.mock('ui/contexts/EnvironmentContext', () => {
  return {
    useEnvironment: jest.fn(() => ({
      displayConfig: {
        theme: {
          general: {
            font_color: '#000000',
          },
        },
        branded: true,
      },
    })),
  };
});

describe('<PoweredByClerk />', () => {
  it('renders', () => {
    const tree = renderJSON(<PoweredByClerk />);
    expect(tree).toMatchSnapshot();
  });
});
