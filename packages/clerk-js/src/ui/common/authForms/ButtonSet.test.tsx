import { render, renderJSON, screen } from '@clerk/shared/testUtils';
import { titleize } from '@clerk/shared/utils/string';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { ButtonSet } from './ButtonSet';

function MockIcon() {
  return (
    <svg>
      <circle
        cx='40'
        cy='40'
        r='24'
      />
    </svg>
  );
}

const options = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: MockIcon,
    strategy: 'oauth_facebook',
  },
  {
    id: 'google',
    name: 'Google',
    icon: MockIcon,
    strategy: 'oauth_google',
  },
];

describe('<ButtonSet/>', () => {
  it('renders the sign in button set for the provided options', () => {
    const mockHandleClick = jest.fn();
    const tree = renderJSON(
      <ButtonSet
        options={options}
        flow='sign-in'
        handleClick={mockHandleClick}
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it.each(['google', 'facebook'])('renders the sign up button set and clicks on %s', async (provider: string) => {
    const providerTitle = titleize(provider);

    const mockHandleClick = jest.fn();

    render(
      <ButtonSet
        options={options}
        flow='sign-up'
        handleClick={mockHandleClick}
      />,
    );

    const regex = new RegExp(`Sign up with ${providerTitle}`, 'i');

    await userEvent.click(screen.getByRole('button', { name: regex }));

    expect(mockHandleClick.mock.calls[0][1]).toBe(`oauth_${provider}`);
  });
});
