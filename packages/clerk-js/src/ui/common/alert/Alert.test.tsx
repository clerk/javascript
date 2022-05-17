import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';

import { Alert } from './Alert';

describe('alert for info', () => {
  it('renders an info alert', () => {
    const tree = renderJSON(<Alert type='error'>Foo</Alert>);
    expect(tree).toMatchSnapshot();
  });
});

describe('alert for error', () => {
  it('renders an error alert', () => {
    const tree = renderJSON(<Alert type='info'>Bar</Alert>);
    expect(tree).toMatchSnapshot();
  });
});
