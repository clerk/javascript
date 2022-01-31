import * as React from 'react';
import { renderJSON } from '@clerk/shared/testUtils';
import { Card } from './Card';

describe('<Card/>', () => {
  it('renders the card and its childredlabel text ', () => {
    const tree = renderJSON(
      <Card>
        <div>Foo</div>
      </Card>
    );
    expect(tree).toMatchSnapshot();
  });
});
