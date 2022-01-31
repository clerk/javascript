import * as React from 'react';
import { renderJSON } from '@clerk/shared/testUtils';
import { Control } from './Control';

describe('<Control/>', () => {
  it('renders the label along with its control, hints, optional status, and errors', () => {
    const tree = renderJSON(
      <Control
        label="foo"
        sublabel="bar"
        hint="qux"
        error="this is an error"
        errorStyle={{ display: 'block' }}
        optional
      >
        Foo
      </Control>
    );
    expect(tree).toMatchSnapshot();
  });
});
