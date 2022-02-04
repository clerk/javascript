import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';

import { DefaultNavBarLinks } from './NavBarLinks';

jest.mock('ui/router/RouteContext');

describe('<DefaultNavBarLinks />', () => {
  it('renders the default user profile navigation links', () => {
    const tree = renderJSON(<DefaultNavBarLinks />);
    expect(tree).toMatchSnapshot();
  });
});
