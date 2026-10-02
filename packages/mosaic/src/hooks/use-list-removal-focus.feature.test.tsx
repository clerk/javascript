import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLayoutEffect, useRef, useState } from 'react';
import { expect, it } from 'vitest';

import { Confirmation } from '../blocks/confirmation';
import { MosaicProvider } from '../mosaic-provider';
import { useListRemovalFocus } from './use-list-removal-focus';

function CaptureRemovalTarget({
  finalFocus,
  onTarget,
}: {
  finalFocus: () => HTMLElement | null;
  onTarget: (target: HTMLElement) => void;
}) {
  useLayoutEffect(() => {
    return () => {
      const target = finalFocus();
      if (target) {
        onTarget(target);
      }
    };
  }, [finalFocus, onTarget]);
  return null;
}

function RemovableList({ onRestoreTarget }: { onRestoreTarget?: (target: HTMLElement) => void }) {
  const [ids, setIds] = useState(['Laptop', 'Phone']);
  const [selected, setSelected] = useState<string | undefined>();
  const add = useRef<HTMLButtonElement>(null);
  const removalFocus = useListRemovalFocus({
    ids,
    onRemove: () => Promise.resolve(),
    fallback: () => add.current,
  });

  return (
    <>
      <button
        type='button'
        ref={add}
      >
        Add
      </button>
      {ids.map(id => (
        <button
          type='button'
          key={id}
          ref={removalFocus.registerTrigger(id)}
          onClick={() => setSelected(id)}
        >
          Manage {id}
        </button>
      ))}
      {onRestoreTarget ? (
        <CaptureRemovalTarget
          finalFocus={removalFocus.finalFocus}
          onTarget={onRestoreTarget}
        />
      ) : null}
      <Confirmation
        open={selected !== undefined}
        onOpenChange={open => {
          if (!open) {
            setSelected(undefined);
          }
        }}
        title='Remove device'
        description={selected}
        actionLabel='Remove'
        finalFocus={removalFocus.finalFocus}
        onConfirm={async () => {
          if (selected === undefined) {
            return;
          }
          await removalFocus.remove(selected);
          setIds(current => current.filter(id => id !== selected));
          setSelected(undefined);
        }}
      />
    </>
  );
}

it.each([
  ['Phone', 'Laptop'],
  ['Laptop', 'Phone'],
])('removes %s and focuses its surviving neighbor %s', async (removed, remaining) => {
  render(
    <MosaicProvider>
      <RemovableList />
    </MosaicProvider>,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: `Manage ${removed}` }));
  await user.click(screen.getByRole('button', { name: 'Remove', exact: true }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  expect(screen.queryByRole('button', { name: `Manage ${removed}` })).toBeNull();
  await waitFor(() => expect(screen.getByRole('button', { name: `Manage ${remaining}` })).toHaveFocus());
});

it('retains surviving row targets during layout-effect cleanup', async () => {
  const targets: HTMLElement[] = [];
  render(
    <MosaicProvider>
      <RemovableList onRestoreTarget={target => targets.push(target)} />
    </MosaicProvider>,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Manage Phone' }));
  await user.click(screen.getByRole('button', { name: 'Remove', exact: true }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  expect(targets).toEqual([screen.getByRole('button', { name: 'Manage Laptop' })]);
});
