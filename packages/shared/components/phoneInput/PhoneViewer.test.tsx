import { renderJSON } from '@clerk/shared/testUtils';
import React from 'react';

import { PhoneViewer } from './PhoneViewer';

describe('<PhoneViewer/>', () => {
  it('displays a formatted us number', () => {
    const tree = renderJSON(<PhoneViewer phoneNumber={'+1 1231231234'} />);
    expect(tree).toMatchSnapshot();
  });

  it('displays a formatted non-us number', () => {
    const tree = renderJSON(<PhoneViewer phoneNumber={'+30 2122212122'} />);
    expect(tree).toMatchSnapshot();
  });
});
