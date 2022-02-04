import { render, renderJSON } from '@clerk/shared/testUtils';
import { SessionActivity } from '@clerk/types';
import * as React from 'react';
import { ActivityIcon } from 'ui/userProfile/security/DevicesAndActivity/ActivityIcon';

describe('<ActivityIcon/>', () => {
  it('renders the component', () => {
    const result = render(
      <ActivityIcon sessionActivity={{ isMobile: true } as SessionActivity} />
    );
    expect(result).toBeDefined();
  });

  it('renders the mobile icon', () => {
    const tree = renderJSON(
      <ActivityIcon sessionActivity={{ isMobile: true } as SessionActivity} />
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders the desktop icon', () => {
    const tree = renderJSON(
      <ActivityIcon sessionActivity={{ isMobile: false } as SessionActivity} />
    );
    expect(tree).toMatchSnapshot();
  });
});
