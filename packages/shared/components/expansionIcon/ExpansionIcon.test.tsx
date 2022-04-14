import { renderJSON } from '@clerk/shared/testUtils';
import type { SvgrComponent } from 'assets/icons/svg';
import * as React from 'react';

import { ExpansionIcon } from './ExpansionIcon';

describe('<ExpansionIcon />', () => {
  it('renders simple expansion icon states', () => {
    const expandedIcon = renderJSON(<ExpansionIcon isExpanded={true} />);
    const retractedIcon = renderJSON(<ExpansionIcon isExpanded={false} />);
    expect(expandedIcon).toMatchSnapshot();
    expect(retractedIcon).toMatchSnapshot();
  });

  it('renders an expansion icon with different Icon', () => {
    const mockSvgIcon: SvgrComponent = () => <svg></svg>;
    const tree = renderJSON(
      <ExpansionIcon
        isExpanded={false}
        CustomExpansionIcon={mockSvgIcon}
      />,
    );
    expect(tree).toMatchSnapshot();
  });
});
