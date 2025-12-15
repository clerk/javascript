import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

import { PortalProvider, usePortalRoot } from '../PortalProvider';
import { portalRootManager } from '../portal-root-manager';

describe('PortalProvider', () => {
  it('provides getContainer to children via context', () => {
    const container = document.createElement('div');
    const getContainer = () => container;

    const TestComponent = () => {
      const portalRoot = usePortalRoot();
      return <div data-testid='test'>{portalRoot === getContainer ? 'found' : 'not-found'}</div>;
    };

    render(
      <PortalProvider getContainer={getContainer}>
        <TestComponent />
      </PortalProvider>,
    );

    expect(screen.getByTestId('test').textContent).toBe('found');
  });

  it('registers with portalRootManager on mount', () => {
    const container = document.createElement('div');
    const getContainer = () => container;
    const pushSpy = vi.spyOn(portalRootManager, 'push');

    const { unmount } = render(
      <PortalProvider getContainer={getContainer}>
        <div>test</div>
      </PortalProvider>,
    );

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(portalRootManager.getCurrent()).toBe(container);

    unmount();
  });

  it('unregisters from portalRootManager on unmount', () => {
    const container = document.createElement('div');
    const getContainer = () => container;
    const popSpy = vi.spyOn(portalRootManager, 'pop');

    const { unmount } = render(
      <PortalProvider getContainer={getContainer}>
        <div>test</div>
      </PortalProvider>,
    );

    unmount();

    expect(popSpy).toHaveBeenCalledTimes(1);
    expect(portalRootManager.getCurrent()).toBeNull();
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
      <PortalProvider getContainer={getContainer}>
        <TestComponent />
      </PortalProvider>,
    );

    expect(screen.getByTestId('test').textContent).toBe('found');
  });

  it('returns manager.getCurrent when outside PortalProvider', () => {
    const container = document.createElement('div');
    portalRootManager.push(() => container);

    const TestComponent = () => {
      const portalRoot = usePortalRoot();
      return <div data-testid='test'>{portalRoot() === container ? 'found' : 'not-found'}</div>;
    };

    render(<TestComponent />);

    expect(screen.getByTestId('test').textContent).toBe('found');

    portalRootManager.pop();
  });

  it('context value takes precedence over manager', () => {
    const contextContainer = document.createElement('div');
    const managerContainer = document.createElement('div');
    const contextGetContainer = () => contextContainer;

    portalRootManager.push(() => managerContainer);

    const TestComponent = () => {
      const portalRoot = usePortalRoot();
      return <div data-testid='test'>{portalRoot() === contextContainer ? 'found' : 'not-found'}</div>;
    };

    render(
      <PortalProvider getContainer={contextGetContainer}>
        <TestComponent />
      </PortalProvider>,
    );

    expect(screen.getByTestId('test').textContent).toBe('found');

    portalRootManager.pop();
  });
});

describe('portalRootManager', () => {
  beforeEach(() => {
    // Clear the stack before each test
    while (portalRootManager.getCurrent() !== null) {
      portalRootManager.pop();
    }
  });

  it('maintains stack of portal roots', () => {
    const container1 = document.createElement('div');
    const container2 = document.createElement('div');
    const getContainer1 = () => container1;
    const getContainer2 = () => container2;

    portalRootManager.push(getContainer1);
    portalRootManager.push(getContainer2);

    expect(portalRootManager.getCurrent()).toBe(container2);

    portalRootManager.pop();
    expect(portalRootManager.getCurrent()).toBe(container1);

    portalRootManager.pop();
  });

  it('getCurrent returns topmost root', () => {
    const container1 = document.createElement('div');
    const container2 = document.createElement('div');
    const getContainer1 = () => container1;
    const getContainer2 = () => container2;

    portalRootManager.push(getContainer1);
    portalRootManager.push(getContainer2);

    expect(portalRootManager.getCurrent()).toBe(container2);

    portalRootManager.pop();
    portalRootManager.pop();
  });

  it('pop removes topmost root', () => {
    const container1 = document.createElement('div');
    const container2 = document.createElement('div');
    const getContainer1 = () => container1;
    const getContainer2 = () => container2;

    portalRootManager.push(getContainer1);
    portalRootManager.push(getContainer2);

    portalRootManager.pop();

    expect(portalRootManager.getCurrent()).toBe(container1);

    portalRootManager.pop();
  });

  it('getCurrent returns null when stack is empty', () => {
    expect(portalRootManager.getCurrent()).toBeNull();
  });
});
