import * as React from 'react';
import { renderJSON } from '@clerk/shared/testUtils';
import { Tag, VerificationStatusTag } from './Tag';

describe('<Tag/>', () => {
  it('renders tag', () => {
    const tree = renderJSON(
      <Tag color="primary" size="lg">
        Foo
      </Tag>
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders the verification status Tag', () => {
    const verifiedTag = renderJSON(<VerificationStatusTag status="verified" />);
    expect(verifiedTag).toMatchSnapshot();

    ['unverified', 'failed', 'expired'].forEach((status) => {
      const failureStatusTag = renderJSON(
        <VerificationStatusTag status={status} />
      );
      expect(failureStatusTag).toMatchSnapshot();
    });

    const unrecognizedTag = renderJSON(
      <VerificationStatusTag status="hello-world" />
    );
    expect(unrecognizedTag).toMatchSnapshot();
  });
});
