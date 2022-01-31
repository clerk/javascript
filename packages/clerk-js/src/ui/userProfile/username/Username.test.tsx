import * as React from 'react';
import { renderJSON } from '@clerk/shared/testUtils';
import { Username } from './Username';
import { UserResource } from '@clerk/types';

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
        username: 'John',
      };
    },
  };
});

describe('<Username/>', () => {
  it('renders the Username', () => {
    const tree = renderJSON(<Username />);
    expect(tree).toMatchSnapshot();
  });
});
