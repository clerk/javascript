import { renderJSON } from '@clerk/shared/testUtils';
import * as React from 'react';

import { InputWithIcon } from './InputWithIcon';

describe('<InputWithIcon/>', () => {
  const TickIcon = () => {
    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <polyline points='20 6 9 17 4 12' />
      </svg>
    );
  };

  it('renders the controlled input along with the icon', () => {
    const onChange = jest.fn();

    const tree = renderJSON(
      <InputWithIcon
        type='text'
        Icon={<TickIcon />}
        placeholder='Select...'
        handleChange={onChange}
      />,
    );

    expect(tree).toMatchSnapshot();
  });
});
