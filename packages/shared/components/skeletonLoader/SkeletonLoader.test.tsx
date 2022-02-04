import { renderJSON } from '@clerk/shared/testUtils';
import React from 'react';

import { SkeletonLoader } from './SkeletonLoader';

describe('SkeletonLoader', function () {
  it('renders', () => {
    const tree = renderJSON(
      <SkeletonLoader
        speed={1.5}
        width={296}
        height={86}
        viewBox="0 0 296 86"
        id="test-loader"
      >
        <rect x="0" y="11" rx="4" ry="4" width="84" height="64" />
        <rect x="148" y="0" rx="2" ry="2" width="64" height="18" />
        <rect x="148" y="24" rx="2" ry="2" width="148" height="18" />
        <rect x="148" y="47" rx="2" ry="2" width="117" height="18" />
        <rect x="148" y="70" rx="2" ry="2" width="53" height="16" />
      </SkeletonLoader>
    );
    expect(tree).toMatchSnapshot();
  });
});
