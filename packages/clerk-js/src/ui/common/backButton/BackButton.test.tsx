import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';

import { BackButton } from './BackButton';

jest.mock('ui/router/RouteContext');

describe('<BackButton/>', () => {
  it('renders the header component', () => {
    const tree = renderJSON(
      <BackButton
        to='foo/bar'
        className='qux'
      />,
    );
    expect(tree).toMatchSnapshot();
  });
});
