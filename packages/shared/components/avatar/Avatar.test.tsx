import { render, renderJSON, screen } from '@clerk/shared/testUtils';
import { fireEvent } from '@testing-library/dom';
import * as React from 'react';

import { Avatar } from './Avatar';

describe('<Avatar/>', () => {
  it('renders the image ', () => {
    const tree = renderJSON(
      <Avatar
        firstName='John'
        lastName='Doe'
        profileImageUrl='http://images.clerktest.host/avatar.png'
        optimize
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders the initials ', () => {
    const tree = renderJSON(
      <Avatar
        firstName='John'
        lastName='Doe'
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders the initials inside an svg if user has no avatar', () => {
    render(
      <Avatar
        firstName='John'
        lastName='Doe'
      />,
    );
    const avatar = screen.getByLabelText('John Doe', { selector: 'svg' });
    expect(avatar).toBeDefined();
  });

  it('renders the img if user has an avatar', () => {
    render(
      <Avatar
        firstName='John'
        lastName='Doe'
        profileImageUrl='https://images.clerktest.host/avatar.png'
      />,
    );
    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toBeDefined();
  });

  it('renders the initials as a fallback if img fails to load', () => {
    render(
      <Avatar
        firstName='John'
        lastName='Doe'
        profileImageUrl='https://images.clerktest.host/avatar.png'
      />,
    );
    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toBeDefined();
    fireEvent.error(avatar);
    expect(screen.findByLabelText('John Doe', { selector: 'svg' })).toBeDefined();
  });

  it('renders the the Gravatar default image if avatar or initials are empty', () => {
    const tree = renderJSON(
      <Avatar
        profileImageUrl=''
        optimize
      />,
    );
    expect(tree).toMatchSnapshot();
  });
});
