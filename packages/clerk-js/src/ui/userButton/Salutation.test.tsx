import { UserResource } from '@clerk/types';
import React from 'react';
import { renderJSON } from '@clerk/shared/testUtils';
import { Salutation } from './Salutation';

describe('Salutation', () => {
  const user = {
    firstName: 'Jane',
    lastName: 'Doe',
  } as UserResource;

  it('renders Salutation', () => {
    const tree = renderJSON(<Salutation user={user} />);
    expect(tree).toMatchSnapshot();
  });
});
