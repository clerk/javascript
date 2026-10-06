import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLayoutEffect, useRef, useState } from 'react';
import { expect, it } from 'vitest';

import { useListRemovalFocus } from '../use-list-removal-focus';

function RestoreFocus({ target }: { target: () => HTMLElement | null }) {
  const targetRef = useRef(target);
  useLayoutEffect(() => {
    targetRef.current = target;
  });
  useLayoutEffect(
    () => () => {
      const element = targetRef.current();
      queueMicrotask(() => element?.focus());
    },
    [],
  );
  return null;
}

function Example() {
  const [ids, setIds] = useState(['removed', 'next']);
  const [open, setOpen] = useState(true);
  const fallback = useRef<HTMLButtonElement>(null);
  const removalFocus = useListRemovalFocus({
    ids,
    onRemove: id => setIds(current => current.filter(item => item !== id)),
    fallback: () => fallback.current,
  });

  return (
    <>
      <button
        type='button'
        ref={fallback}
      >
        Current device
      </button>
      {ids.map(id => (
        <button
          key={id}
          type='button'
          ref={removalFocus.registerTrigger(id)}
        >
          {id}
        </button>
      ))}
      <div>{open ? <RestoreFocus target={removalFocus.finalFocus} /> : null}</div>
      <button
        type='button'
        onClick={() => {
          void removalFocus.remove('removed').then(() => setOpen(false));
        }}
      >
        Sign out
      </button>
    </>
  );
}

it('focuses the next row when removal and dialog cleanup share a commit', async () => {
  render(<Example />);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Sign out' }));

  await waitFor(() => expect(screen.getByRole('button', { name: 'next' })).toHaveFocus(), { timeout: 1000 });
  expect(screen.queryByRole('button', { name: 'removed' })).not.toBeInTheDocument();
});
