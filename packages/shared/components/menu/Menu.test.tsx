import { render, renderJSON, screen, userEvent } from '@clerk/shared/testUtils';
import * as React from 'react';

import { ServerIcon } from '../../assets/icons';
import { Menu } from './Menu';

describe('<Menu/>', () => {
  const options = [
    {
      label: 'Foo',
      icon: <ServerIcon />,
    },
    { label: 'Bar' },
  ];

  it('renders the menu options', () => {
    const tree = renderJSON(
      <Menu
        options={options}
        className='foo'
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('triggers the option callback upon clicking on it', async () => {
    const opts = options.map(o => ({
      ...o,
      handleSelect: jest.fn(),
    }));

    render(<Menu options={opts} />);

    const trigger1 = screen.getByText('Foo');
    await userEvent.click(trigger1);
    expect(opts[0].handleSelect).toHaveBeenCalledTimes(1);

    const trigger2 = screen.getByText('Bar');
    await userEvent.click(trigger2);
    expect(opts[0].handleSelect).toHaveBeenCalledTimes(1);
  });
});
