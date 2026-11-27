import { clerkEvents, createClerkEventBus } from '@clerk/shared/clerkEventBus';
import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import { ClerkLoaded, ClerkLoading } from '../../components/controlComponents';
import { IsomorphicClerk } from '../../isomorphicClerk';
import { ClerkProvider } from '../ClerkProvider';

afterEach(() => {
  IsomorphicClerk.clearInstance();
  delete (globalThis as any).Clerk;
});

it('renders a preloaded Clerk as loaded on the first render', () => {
  const eventBus = createClerkEventBus();
  eventBus.emit(clerkEvents.Status, 'ready');
  const clerk = {
    loaded: true,
    status: 'ready',
    on: eventBus.on,
    off: eventBus.off,
    addListener: vi.fn(() => vi.fn()),
    __internal_updateProps: vi.fn(),
  };
  const renders: string[] = [];
  const RecordRender = ({ value }: { value: string }) => {
    renders.push(value);
    return <div>{value}</div>;
  };

  const result = render(
    <ClerkProvider
      Clerk={clerk as any}
      publishableKey='pk_test_Y2xlcmsuY2xlcmsuZGV2JA'
    >
      <ClerkLoading>
        <RecordRender value='loading' />
      </ClerkLoading>
      <ClerkLoaded>
        <RecordRender value='loaded' />
      </ClerkLoaded>
    </ClerkProvider>,
  );

  expect(renders).toEqual(['loaded']);
  expect(result.queryByText('loading')).toBeNull();
  expect(result.getByText('loaded')).toBeTruthy();
});
