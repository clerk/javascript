import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ClerkHostRenderer } from '../ClerkHostRenderer';

vi.mock('@clerk/shared/object', () => ({
  without: (obj: Record<string, unknown>, ...keys: string[]) =>
    Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key))),
}));

vi.mock('@clerk/shared/react', () => ({
  isDeeplyEqual: (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b),
}));

describe('<ClerkHostRenderer />', () => {
  it('updates mounted component props when custom pages are added or removed', () => {
    const mount = vi.fn();
    const unmount = vi.fn();
    const updateProps = vi.fn();

    const { rerender } = render(
      <ClerkHostRenderer
        mount={mount}
        props={{ customPages: [{ label: 'General' }] }}
        unmount={unmount}
        updateProps={updateProps}
      />,
    );

    rerender(
      <ClerkHostRenderer
        mount={mount}
        props={{ customPages: [{ label: 'General' }, { label: 'Permissions' }] }}
        unmount={unmount}
        updateProps={updateProps}
      />,
    );

    expect(updateProps).toHaveBeenCalledTimes(1);
    expect(updateProps).toHaveBeenCalledWith({
      node: expect.any(HTMLDivElement),
      props: { customPages: [{ label: 'General' }, { label: 'Permissions' }] },
    });
  });
});
