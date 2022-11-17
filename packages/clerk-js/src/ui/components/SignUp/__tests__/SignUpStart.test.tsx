import React from 'react';

import { createFixture as _createFixture, render, screen } from '../../../../testUtils';
import { SignUpStart } from '../SignUpStart';

const createFixture = _createFixture('SignUp');

describe('SignUpStart', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixture();
    render(<SignUpStart />, { wrapper });
    screen.getByText(/create/i);
  });
});
