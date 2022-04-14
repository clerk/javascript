import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';

import { Popover } from './Popover';

describe('<Popover/>', () => {
  it('renders just the trigger when inactive', () => {
    const tree = renderJSON(<Popover className='Foo'>Foo</Popover>);

    expect(tree).toMatchSnapshot();
  });

  it('renders the trigger and the popover when active', () => {
    const tree = renderJSON(
      <Popover
        active
        className='Foo'
      >
        Foo
      </Popover>,
    );
    expect(tree).toMatchSnapshot();
  });
});
