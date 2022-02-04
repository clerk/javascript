import { renderJSON } from '@clerk/shared/testUtils';
import { UserResource } from '@clerk/types';
import * as React from 'react';

import { FirstName } from './FirstName';

const mockNavigate = jest.fn();

jest.mock('ui/hooks', () => ({
  useNavigate: () => {
    return {
      navigate: mockNavigate,
    };
  },
}));

jest.mock('ui/router/RouteContext');

jest.mock('ui/contexts/CoreUserContext', () => {
  return {
    useCoreUser: (): Partial<UserResource> => {
      return {
        firstName: 'John',
      };
    },
  };
});

describe('<FirstName/>', () => {
  it('renders the FirstName', () => {
    const tree = renderJSON(<FirstName />);
    expect(tree).toMatchSnapshot();
  });
});
