import { renderJSON } from '@clerk/shared/testUtils';
import React from 'react';

import { Connections, PrimaryTag } from './util';

describe('Utility components for EmailAddresses', () => {
  it('renders the primary tag', () => {
    const tree = renderJSON(<PrimaryTag />);
    expect(tree).toMatchSnapshot();
  });

  it('renders email connections', () => {
    const linkedResources = [
      { id: '123', type: 'oauth_google' },
      { id: '456', type: 'oauth_facebook' },
    ];
    const connections = renderJSON(
      <Connections linkedResources={linkedResources} />
    );
    expect(connections).toMatchSnapshot();
  });
});
