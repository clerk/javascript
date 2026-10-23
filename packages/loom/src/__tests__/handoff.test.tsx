import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it } from 'vitest';

import { LoomHandoff, LoomProvider, useUserSnapshot } from '../handoff';
import { clerkHost, publicUser, userSeed } from './fixtures/react';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
let container: HTMLDivElement;

afterEach(async () => {
  await act(() => root?.unmount());
  root = undefined;
  container?.remove();
});

async function render(children: ReactNode) {
  if (!root) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  }
  await act(() => root?.render(children));
}

function SnapshotUser() {
  const { scope, user } = useUserSnapshot();
  return (
    <p>
      {scope.userId}: {user.firstName}
    </p>
  );
}

it('keeps the initial seed when route props change before Clerk resolves', async () => {
  const { host } = clerkHost();
  const first = userSeed(host);
  const second = {
    ...first,
    scope: { ...first.scope, userId: 'user_b' },
    user: { data: { ...publicUser, id: 'user_b', firstName: 'Other' }, updatedAt: Date.now() },
  };
  const tree = (hydration: typeof first) => (
    <LoomProvider
      clerk={null}
      hydration={hydration}
    >
      <LoomHandoff live={<p>Live</p>}>
        <SnapshotUser />
      </LoomHandoff>
    </LoomProvider>
  );
  await render(tree(first));
  expect(container.textContent).toBe('user_a: Ada');
  await render(tree(second));
  expect(container.textContent).toBe('user_a: Ada');
});

it('passes legacy snapshot children through without the new provider', async () => {
  await render(<LoomHandoff live={<p>Live</p>}>Legacy</LoomHandoff>);
  expect(container.textContent).toBe('Legacy');
});
