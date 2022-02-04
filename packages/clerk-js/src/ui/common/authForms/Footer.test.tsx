import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';

import { Footer } from './Footer';

describe('<Footer/>', () => {
  it('renders the footer component', () => {
    const tree = renderJSON(<Footer>Foo</Footer>);
    expect(tree).toMatchSnapshot();
  });
});
