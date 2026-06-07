import { render, screen } from '@testing-library/react';
import React, { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useCustomElementPortal } from '../useCustomElementPortal';

describe('useCustomElementPortal', () => {
  let portalRoot: HTMLDivElement;

  afterEach(() => {
    portalRoot?.remove();
  });

  it('does not remount portal content when the parent rerenders', async () => {
    const mountTracker = vi.fn();
    const unmountTracker = vi.fn();

    const CustomContent = ({ label }: { label: string }) => {
      useEffect(() => {
        mountTracker();
        return unmountTracker;
      }, []);

      return <div>{label}</div>;
    };

    const TestComponent = ({ label }: { label: string }) => {
      const [{ mount, portal: Portal, unmount }] = useCustomElementPortal([
        { component: <CustomContent label={label} />, id: 0 },
      ]);

      useEffect(() => {
        mount(portalRoot);
        return unmount;
      }, [mount, unmount]);

      return <Portal />;
    };

    portalRoot = document.createElement('div');
    document.body.appendChild(portalRoot);

    const { rerender } = render(<TestComponent label='first render' />);

    await screen.findByText('first render');
    expect(mountTracker).toHaveBeenCalledTimes(1);

    rerender(<TestComponent label='second render' />);

    await screen.findByText('second render');
    expect(mountTracker).toHaveBeenCalledTimes(1);
    expect(unmountTracker).not.toHaveBeenCalled();

    expect(portalRoot.textContent).toBe('second render');
  });

  it('renders falsy ReactNode values after mounting', async () => {
    const TestComponent = () => {
      const [{ mount, portal: Portal, unmount }] = useCustomElementPortal([{ component: 0, id: 0 }]);

      useEffect(() => {
        mount(portalRoot);
        return unmount;
      }, [mount, unmount]);

      return <Portal />;
    };

    portalRoot = document.createElement('div');
    document.body.appendChild(portalRoot);

    render(<TestComponent />);

    await screen.findByText('0');
    expect(portalRoot.textContent).toBe('0');
  });

  it('keeps string and number ids in separate portal caches', async () => {
    const TestComponent = () => {
      const [
        { mount: mountNumber, portal: NumberPortal, unmount: unmountNumber },
        { mount: mountString, portal: StringPortal, unmount: unmountString },
      ] = useCustomElementPortal([
        { component: <div>number id</div>, id: 1 },
        { component: <div>string id</div>, id: '1' },
      ]);

      useEffect(() => {
        mountNumber(portalRoot);
        mountString(portalRoot);

        return () => {
          unmountNumber();
          unmountString();
        };
      }, [mountNumber, mountString, unmountNumber, unmountString]);

      return (
        <>
          <NumberPortal />
          <StringPortal />
        </>
      );
    };

    portalRoot = document.createElement('div');
    document.body.appendChild(portalRoot);

    render(<TestComponent />);

    await screen.findByText('number id');
    await screen.findByText('string id');
    expect(portalRoot.textContent).toBe('number idstring id');
  });
});
