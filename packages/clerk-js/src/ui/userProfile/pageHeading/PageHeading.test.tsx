import * as React from 'react';
import { PageHeading } from './PageHeading';
import { renderJSON } from '@clerk/shared/testUtils';

jest.mock('ui/router/RouteContext');

describe('<PageHeading/>', () => {
  it('renders the header component', () => {
    const tree = renderJSON(
      <PageHeading
        backTo="foo/bar"
        title="title"
        subtitle="subtitle"
        className="qux"
      />
    );
    expect(tree).toMatchSnapshot();
  });
});
