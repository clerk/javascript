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

  it('defaults to path routing and a path prop is required', () => {
    const TestingComponent = props => {
      const options = useRoutingProps('TestingComponent', props);
      return <div>{JSON.stringify(options)}</div>;
    };

    expect(() => {
      render(<TestingComponent />);
    }).toThrowError(/@clerk\/clerk-react: The <TestingComponent\/> component uses path-based routing by default/);
  });

  it('the path option is ignored when "hash" routing prop', () => {
    const TestingComponent = props => {
      const options = useRoutingProps('TestingComponent', props, { path: '/path-option' });
      return <div>{JSON.stringify(options)}</div>;
    };

    const { baseElement } = render(
      <TestingComponent
        routing='hash'
        prop1='1'
        prop2='2'
      />,
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('the path option is ignored when "virtual" routing prop', () => {
    const TestingComponent = props => {
      const options = useRoutingProps('TestingComponent', props, { path: '/path-option' });
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

  it('throws error when "hash" routing and path prop are set', () => {
    const TestingComponent = props => {
      const options = useRoutingProps('TestingComponent', props);
      return <div>{JSON.stringify(options)}</div>;
    };

    expect(() => {
      render(
        <TestingComponent
          routing='hash'
          path='/path-prop'
        />,
      );
    }).toThrowError(
      /@clerk\/clerk-react: The `path` prop will only be respected when the Clerk component uses path-based routing/,
    );
  });

  it('throws error when "virtual" routing and path prop are set', () => {
    const TestingComponent = props => {
      const options = useRoutingProps('TestingComponent', props);
      return <div>{JSON.stringify(options)}</div>;
    };

    expect(() => {
      render(
        <TestingComponent
          routing='virtual'
          path='/path'
        />,
      );
    }).toThrowError(
      /@clerk\/clerk-react: The `path` prop will only be respected when the Clerk component uses path-based routing/,
    );
  });

  it('path prop has priority over path option', () => {
    const TestingComponent = props => {
      const options = useRoutingProps('TestingComponent', props, { path: '/path-option' });
      return <div>{JSON.stringify(options)}</div>;
    };

    const { baseElement } = render(
      <TestingComponent
        path='/path-prop'
        prop1='1'
        prop2='2'
      />,
    );
    expect(baseElement).toMatchSnapshot();
  });
});
