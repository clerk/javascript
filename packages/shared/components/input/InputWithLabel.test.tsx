import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';

import { InputWithLabel } from './InputWithLabel';

describe('<InputWithLabel/>', () => {
  it('renders the label along with its input', () => {
    const tree = renderJSON(
      <InputWithLabel
        type="text"
        placeholder="Type some text"
        placement="left"
        label={'example.com'}
      />
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders the component input with error', () => {
    const tree = renderJSON(
      <InputWithLabel type="text" hasError label={'example.com'} />
    );
    expect(tree).toMatchSnapshot();
  });
});
