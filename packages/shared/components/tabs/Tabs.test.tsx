import * as React from 'react';
import { fireEvent, render, screen } from '@clerk/shared/testUtils';
import { Tabs } from './Tabs';

describe('<Tabs/>', () => {
  it('renders and switchs tabs upon click on their title', async () => {
    const { getByText } = render(
      <Tabs defaultSelectedIndex={1}>
        <div title="Foo">Foo tab</div>
        <div title="Bar">Bar tab</div>
        <div title="Qux">Qux tab</div>
      </Tabs>
    );

    // Renders table titles
    const titles = await screen.findAllByRole('tab');
    expect(titles).toHaveLength(3);

    // Render selected tab
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Bar tab');

    // Click on another tab
    fireEvent.click(getByText('Foo'));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Foo tab');
  });
});
