import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';

import { Info } from './Info';

describe('<info/>', () => {
  it('renders the info component', () => {
    const tree = renderJSON(<Info>Foo</Info>);
    expect(tree).toMatchSnapshot();
  });
});
