import * as React from 'react';
import { renderJSON } from '@clerk/shared/testUtils';
import { Body } from './Body';

describe('<Body/>', () => {
  it('renders the body component', () => {
    const tree = renderJSON(<Body>Foo</Body>);
    expect(tree).toMatchSnapshot();
  });
});
