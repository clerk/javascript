import * as React from 'react';
import { renderJSON } from '@clerk/shared/testUtils';
import { Spinner } from './Spinner';

describe('<Spinner/>', () => {
  it('renders the spinner', () => {
    const tree = renderJSON(<Spinner />);
    expect(tree).toMatchSnapshot();
  });

  it('renders the inverted spinner', () => {
    const tree = renderJSON(<Spinner inverted />);
    expect(tree).toMatchSnapshot();
  });
});
