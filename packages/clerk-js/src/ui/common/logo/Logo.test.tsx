import * as React from 'react';
import { Logo } from './Logo';
import { useEnvironment } from 'ui/contexts/EnvironmentContext';
import {
  fireEvent,
  mocked,
  render,
  renderJSON,
  screen,
} from '@clerk/shared/testUtils';
import { PartialDeep } from 'type-fest';
import { EnvironmentResource } from '@clerk/types';

jest.mock('ui/contexts/EnvironmentContext', () => {
  return {
    useEnvironment: jest.fn(),
  };
});

describe('<Logo/>', () => {
  it('does not render the image logo while loading', () => {
    mocked(
      useEnvironment as jest.Mock<PartialDeep<EnvironmentResource>>,
      true
    ).mockImplementation(() => ({
      displayConfig: {
        applicationName: 'Foo',
        logoImage: {
          public_url: 'http://test.host/image.img',
        },
      },
    }));

    render(<Logo />);
    const img = screen.getByRole('img', { hidden: true });
    expect(img).toBeDefined();
    expect(img).toHaveStyle({ display: 'none' });
    fireEvent.load(img);
    expect(img).toHaveStyle({ display: 'unset' });
  });

  it('renders the image logo', () => {
    mocked(
      useEnvironment as jest.Mock<PartialDeep<EnvironmentResource>>,
      true
    ).mockImplementation(() => ({
      displayConfig: {
        applicationName: 'Foo',
        logoImage: {
          public_url: 'http://test.host/image.img',
        },
      },
    }));
    const tree = renderJSON(<Logo />);
    expect(tree).toMatchSnapshot();
  });

  it('renders the text logo', () => {
    mocked(
      useEnvironment as jest.Mock<PartialDeep<EnvironmentResource>>,
      true
    ).mockImplementation(() => ({
      displayConfig: {
        applicationName: 'Foo',
      },
    }));
    const tree = renderJSON(<Logo />);
    expect(tree).toMatchSnapshot();
  });
});
