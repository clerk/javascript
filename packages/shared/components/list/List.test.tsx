import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';

import { List } from './List';

describe('<List/>', () => {
  it('renders the list', () => {
    const tree = renderJSON(
      <List>
        <List.Item>1st list item</List.Item>
        <List.Item detail={false} hoverable={false} lines={false}>
          2nd list item
        </List.Item>
      </List>
    );
    expect(tree).toMatchSnapshot();
  });
});
