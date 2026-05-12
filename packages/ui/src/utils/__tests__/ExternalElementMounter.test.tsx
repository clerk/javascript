import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ExternalElementMounter } from '../ExternalElementMounter';

describe('ExternalElementMounter', () => {
  it('calls mount with the host div element', async () => {
    const mount = vi.fn();
    const unmount = vi.fn();

    render(
      <ExternalElementMounter
        mount={mount}
        unmount={unmount}
      />,
    );

    await waitFor(() => expect(mount).toHaveBeenCalledOnce());
    expect(mount).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('calls unmount with the same element when removed', async () => {
    const mount = vi.fn();
    const unmount = vi.fn();

    const { unmount: removeComponent } = render(
      <ExternalElementMounter
        mount={mount}
        unmount={unmount}
      />,
    );

    await waitFor(() => expect(mount).toHaveBeenCalledOnce());
    const mountedEl = mount.mock.calls[0][0];
    removeComponent();

    expect(unmount).toHaveBeenCalledWith(mountedEl);
  });

  it('calls mount even when a forwarded ref is present in props (React 19 regression)', async () => {
    // In React 19, ref is a regular prop. Before the fix, a ref forwarded through
    // the component chain would land in ...rest and overwrite nodeRef in
    // `<div ref={nodeRef} {...rest} />`, preventing mount from being called.
    // React 18 strips ref before passing to non-forwardRef components, so the
    // regression is only observable in a React 19 runtime — but this test guards
    // against it being reintroduced.
    const mount = vi.fn();
    const unmount = vi.fn();

    render(
      React.createElement(ExternalElementMounter, {
        mount,
        unmount,
        ref: { current: null },
      }),
    );

    await waitFor(() => expect(mount).toHaveBeenCalledOnce());
    expect(mount).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
