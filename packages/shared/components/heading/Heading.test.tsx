import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';

import { Heading } from './Heading';

describe('<Heading/>', () => {
  it('renders h1 heading', () => {
    const tree = renderJSON(<Heading as="h1">Top heading</Heading>);
    expect(tree).toMatchSnapshot();
  });
});
