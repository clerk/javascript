import * as React from 'react';
import { renderJSON } from '@clerk/shared/testUtils';
import { Separator } from './Separator';

describe('<Separator/>', () => {
  it('renders', () => {
    const tree = renderJSON(<Separator />);
    expect(tree).toMatchSnapshot();
  });
});
