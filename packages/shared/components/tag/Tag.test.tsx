import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';

import { Tag, VerificationStatusTag } from './Tag';
import { VerificationStatus } from '@clerk/types';

describe('<Tag/>', () => {
  it('renders tag', () => {
    const tree = renderJSON(
      <Tag
        color='primary'
        size='lg'
      >
        Foo
      </Tag>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders the verification status Tag', () => {
    const verifiedTag = renderJSON(<VerificationStatusTag status='verified' />);
    expect(verifiedTag).toMatchSnapshot();

    const failureStatuses: VerificationStatus[] = ['unverified', 'failed', 'expired'];
    failureStatuses.forEach(status => {
      const failureStatusTag = renderJSON(<VerificationStatusTag status={status} />);
      expect(failureStatusTag).toMatchSnapshot();
    });

    const unrecognizedTag = renderJSON(<VerificationStatusTag status='transferable' />);
    expect(unrecognizedTag).toMatchSnapshot();
  });
});
