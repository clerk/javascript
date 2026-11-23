import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { $clerk, $csrState } from '../../stores/internal';
import { OAuthDeviceVerification } from '../uiComponents';

describe('<OAuthDeviceVerification />', () => {
  afterEach(() => {
    $clerk.set(null);
    $csrState.set({
      isLoaded: false,
      client: undefined,
      user: undefined,
      session: undefined,
      organization: undefined,
    });
  });

  it('updates the mounted component when its appearance changes', () => {
    const mount = vi.fn();
    const unmount = vi.fn();
    const updateProps = vi.fn();
    $clerk.set({
      __internal_mountOAuthDeviceVerification: mount,
      __internal_unmountOAuthDeviceVerification: unmount,
      __internal_updateProps: updateProps,
    } as any);
    $csrState.set({
      isLoaded: true,
      client: undefined,
      user: undefined,
      session: undefined,
      organization: undefined,
    });
    const firstAppearance = {};
    const secondAppearance = {};
    const { rerender } = render(<OAuthDeviceVerification appearance={firstAppearance} />);

    rerender(<OAuthDeviceVerification appearance={secondAppearance} />);

    expect(mount).toHaveBeenCalledOnce();
    expect(updateProps).toHaveBeenCalledOnce();
    expect(updateProps).toHaveBeenCalledWith({
      node: expect.any(HTMLDivElement),
      props: { appearance: secondAppearance },
    });
  });
});
