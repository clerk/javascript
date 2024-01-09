import { render } from '@testing-library/react';
import React from 'react';

import { useRoutingProps } from '../useRoutingProps';

const originalError = console.error;

describe('useRoutingProps()', () => {
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('throws error without routing & path props', () => {
    const TestingComponent = props => {
      const options = useRoutingProps('TestingComponent', props);
      return <div>{JSON.stringify(options)}</div>;
    };

    expect(() => {
      render(<TestingComponent />);
    }).toThrowError('<TestingComponent/> is missing a path prop to work with path based routing');
  });

  it('returns path routing with passed props and options if path prop is passed', () => {
    const TestingComponent = props => {
      const options = useRoutingProps('TestingComponent', props);
      return <div>{JSON.stringify(options)}</div>;
    };

    const { baseElement } = render(
      <TestingComponent
        path='/aloha'
        prop1='1'
        prop2='2'
      />,
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('returns passed props and options for routing different than path', () => {
    const TestingComponent = props => {
      const options = useRoutingProps('TestingComponent', props);
      return <div>{JSON.stringify(options)}</div>;
    };

    const { baseElement } = render(
      <TestingComponent
        routing='virtual'
        prop1='1'
        prop2='2'
      />,
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('returns passed props and options if path is passed from routing options', () => {
    const TestingComponent = props => {
      const options = useRoutingProps('TestingComponent', props, { path: '/aloha' });
      return <div>{JSON.stringify(options)}</div>;
    };

    const { baseElement } = render(
      <TestingComponent
        prop1='1'
        prop2='2'
      />,
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('returns passed props but omits path prop if path is passed from routing options and a routing strategy other than path is specified', () => {
    const TestingComponent = props => {
      const options = useRoutingProps('TestingComponent', props, { path: '/aloha' });
      return <div>{JSON.stringify(options)}</div>;
    };

    const { baseElement } = render(
      <TestingComponent
        prop1='1'
        prop2='2'
        routing='virtual'
      />,
    );
    expect(baseElement).toMatchSnapshot();
  });
});
