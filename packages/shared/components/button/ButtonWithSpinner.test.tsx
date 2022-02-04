import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';

import { ButtonWithSpinner } from './ButtonWithSpinner';

describe('<ButtonWithSpinner/>', () => {
  it('renders the button', () => {
    const tree = renderJSON(
      <ButtonWithSpinner isLoading type="submit">
        Foo
      </ButtonWithSpinner>
    );
    expect(tree).toMatchSnapshot();
  });
});
