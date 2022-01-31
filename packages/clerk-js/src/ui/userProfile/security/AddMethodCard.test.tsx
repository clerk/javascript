import * as React from 'react';
import { renderJSON } from '@clerk/shared/testUtils';
import { AddMethodCard } from './AddMethodCard';

jest.mock('ui/contexts', () => {
  return {
    useCoreClerk: jest.fn(() => ({})),
  };
});

it('renders the add method card', () => {
  const tree = renderJSON(<AddMethodCard />);
  expect(tree).toMatchSnapshot();
});
