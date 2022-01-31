import * as React from 'react';
import { renderJSON } from '@clerk/shared/testUtils';
import { Label } from './Label';

describe('<Label/>', () => {
  it('renders the label text ', () => {
    const tree = renderJSON(<Label text="Foo" />);
    expect(tree).toMatchSnapshot();
  });

  it('renders the label children', () => {
    const tree = renderJSON(
      <Label>
        <span>Bar</span>
      </Label>
    );
    expect(tree).toMatchSnapshot();
  });
});
