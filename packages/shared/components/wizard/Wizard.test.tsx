import * as React from 'react';
import { renderJSON } from '@clerk/shared/testUtils';
import { Wizard } from './Wizard';

describe('<Wizard/>', () => {
  it('renders the selected child', async () => {
    const tree = renderJSON(
      <Wizard defaultStep={1}>
        <div title="Foo">Foo tab</div>
        <div title="Bar">Bar tab</div>
        <div title="Qux">Qux tab</div>
      </Wizard>
    );

    expect(tree).toMatchSnapshot();
  });
});
