import * as React from 'react';
import { BackButton } from './BackButton';
import { renderJSON } from '@clerk/shared/testUtils';

jest.mock('ui/router/RouteContext');

describe('<BackButton/>', () => {
  it('renders the header component', () => {
    const tree = renderJSON(<BackButton to="foo/bar" className="qux" />);
    expect(tree).toMatchSnapshot();
  });
});
