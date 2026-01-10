import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { UNSAFE_PortalProvider, usePortalRoot } from '../PortalProvider';

describe('UNSAFE_PortalProvider', () => {
  it('provides getContainer to children via context', () => {
    const container = document.createElement('div');
    const getContainer = () => container;

    const TestComponent = () => {
      const portalRoot = usePortalRoot();
      return <div data-testid='test'>{portalRoot === getContainer ? 'found' : 'not-found'}</div>;
    };

    render(
      <UNSAFE_PortalProvider getContainer={getContainer}>
        <TestComponent />
      </UNSAFE_PortalProvider>,
    );

    expect(screen.getByTestId('test').textContent).toBe('found');
  });

  it('only affects components within the provider', () => {
    const container = document.createElement('div');
    const getContainer = () => container;

    const InsideComponent = () => {
      const portalRoot = usePortalRoot();
      return <div data-testid='inside'>{portalRoot() === container ? 'container' : 'null'}</div>;
    };

    const OutsideComponent = () => {
      const portalRoot = usePortalRoot();
      return <div data-testid='outside'>{portalRoot() === null ? 'null' : 'container'}</div>;
    };

    render(
      <>
        <OutsideComponent />
        <UNSAFE_PortalProvider getContainer={getContainer}>
          <InsideComponent />
        </UNSAFE_PortalProvider>
      </>,
    );

    expect(screen.getByTestId('inside').textContent).toBe('container');
    expect(screen.getByTestId('outside').textContent).toBe('null');
  });
});

describe('usePortalRoot', () => {
  it('returns getContainer from context when inside PortalProvider', () => {
    const container = document.createElement('div');
    const getContainer = () => container;

    const TestComponent = () => {
      const portalRoot = usePortalRoot();
      return <div data-testid='test'>{portalRoot() === container ? 'found' : 'not-found'}</div>;
    };

    render(
      <UNSAFE_PortalProvider getContainer={getContainer}>
        <TestComponent />
      </UNSAFE_PortalProvider>,
    );

    expect(screen.getByTestId('test').textContent).toBe('found');
  });

  it('returns a function that returns null when outside PortalProvider', () => {
    const TestComponent = () => {
      const portalRoot = usePortalRoot();
      return <div data-testid='test'>{portalRoot() === null ? 'null' : 'not-null'}</div>;
    };

    render(<TestComponent />);

    expect(screen.getByTestId('test').textContent).toBe('null');
  });

  it('supports nested providers with innermost taking precedence', () => {
    const outerContainer = document.createElement('div');
    const innerContainer = document.createElement('div');

    const TestComponent = () => {
      const portalRoot = usePortalRoot();
      return <div data-testid='test'>{portalRoot() === innerContainer ? 'inner' : 'outer'}</div>;
    };

    render(
      <UNSAFE_PortalProvider getContainer={() => outerContainer}>
        <UNSAFE_PortalProvider getContainer={() => innerContainer}>
          <TestComponent />
        </UNSAFE_PortalProvider>
      </UNSAFE_PortalProvider>,
    );

    expect(screen.getByTestId('test').textContent).toBe('inner');
  });
});
