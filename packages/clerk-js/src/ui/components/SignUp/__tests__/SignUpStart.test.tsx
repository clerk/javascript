import React from 'react';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
import { SignUpStart } from '../SignUpStart';

const { createFixtures } = bindCreateFixtures('SignUp');

describe('SignUpStart', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures();
    render(<SignUpStart />, { wrapper });
    screen.getByText(/create/i);
  });
});
