import { renderJSON } from '@clerk/shared/testUtils';
import { UserResource } from '@clerk/types';
import * as React from 'react';

import { LastName } from './LastName';

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
        lastName: 'John',
      };
    },
  };
});

describe('<LastName/>', () => {
  it('renders the LastName', () => {
    const tree = renderJSON(<LastName />);
    expect(tree).toMatchSnapshot();
  });
});
