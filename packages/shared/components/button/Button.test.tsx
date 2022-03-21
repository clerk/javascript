import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';

import { Button } from './Button';

describe('<Button/>', () => {
  it('renders the button', () => {
    const tree = renderJSON(<Button type='submit'>Foo</Button>);
    expect(tree).toMatchSnapshot();
  });
});

describe("<Button buttonSize='small' />", () => {
  it('renders the small variant', () => {
    const tree = renderJSON(
      <Button
        buttonSize='small'
        type='submit'
      >
        Foo
      </Button>,
    );
    expect(tree).toMatchSnapshot();
  });
});
