import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';

import { Error } from './Error';

describe('<Error/>', () => {
  it('renders the error component', () => {
    const tree = renderJSON(<Error>Foo</Error>);
    expect(tree).toMatchSnapshot();
  });
});
