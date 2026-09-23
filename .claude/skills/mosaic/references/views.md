# Views

The view renders plain props and calls plain callbacks. Nothing else.

- **No Clerk imports.** No data-fetching hooks. No mutation calls.
- **No machine snapshot.** The controller (`controllers.md`) derives the props
  the view branches on — `open`, `pendingKey`, `isDeleting`, `errorMessage` — so
  the view never reaches into `snapshot.value` or calls `send`.
- **An absent callback hides the affordance it drives.** The model expresses "the
  instance does not offer this" by omitting the callback, so the view's check is
  a plain `? :` rather than a capability flag of its own.
- **Take derived booleans from the controller.** `actor.can(...)` results are
  passed in — the view never re-implements a machine guard.

```tsx
export function UserButtonView({ open, onOpenChange, pendingKey, onSignOutAll, ...data }: UserButtonProps) {
  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
    >
      {onSignOutAll ? (
        <Item
          onClick={onSignOutAll}
          busy={pendingKey === userButtonBusyKeys.signOutAll()}
        >
          {m.footer.signOutAll}
        </Item>
      ) : null}
    </Popover>
  );
}
```

## Composition

Two shapes, chosen by whether the slice fetches its own data:

- A **wrapper composes** model + controller + view, and the view is a pure
  function of props (`user-button.tsx`).
- A **leaf view owns its controller** and takes the effect as a prop
  (`UserProfileDeleteSectionView` calls `useUserProfileDeleteSectionController`
  with its `onDelete`). Still no Clerk — the effect arrives from above.

## Where the strings live

Every string a view renders comes from the feature's `*.messages.ts`, shaped the
way `@clerk/i18n` takes a base definition, so localizing is registering a
namespace rather than hunting literals down first. A plural message is its forms;
a parameterized one is its template. Import it as `m` and read through it:

```tsx
import { fill, plural, userButtonBase as m } from './user-button.messages';
```

## Blocks

A **block** is a view fragment that owns one piece of state nothing outside it can
use, and takes the rest as props. `blocks/destructive` is the example: it holds
the half-typed confirmation phrase and compares it, while `open`, `isDeleting`,
and `errorMessage` come from the controller, because those are what decide
whether the dialog closes or explains itself.

```tsx
<Destructive
  open={isOpen}
  onOpenChange={onOpenChange}
  trigger={<Button color='negative'>{m.actionLabel}</Button>}
  title={m.dialogTitle}
  confirmationValue={m.fieldPlaceholder}
  onDelete={onConfirm}
  isDeleting={isDeleting}
  errorMessage={errorMessage}
/>
```

## Pure derivation belongs beside the view, not in it

Which affordance lands in which slot, and how a consumer's `order` array
rearranges a list, are decisions with no React in them. They live in
`*.layout.ts` / `*.utils.ts` and get their own tests — the view calls the result.

## Removing a row takes focus with it

A dialog returns focus to its trigger on close. When the action removes the row
that trigger sits on — signing a device out, removing an email — the trigger
unmounts and focus falls to `<body>`. Nothing catches it: the menu item that
opened the dialog unmounted with the menu, and a dialog mounted at the section
rather than inside the menu has no floating-tree ancestor to walk back to. A
keyboard user loses their place mid-list and a screen reader announces nothing.

Hand focus to a surviving element. `finalFocus` on `Dialog.Popup` and on the
`Confirmation` block takes a function, resolved when the dialog closes — which is
after the row has gone, so it can pick from what is left:

```tsx
const triggers = useRef(new Map<string, HTMLButtonElement>());
const removed = useRef<number | undefined>(undefined);

const removeRow = async (row: Row) => {
  const index = rows.findIndex(candidate => candidate.id === row.id);
  await onRemove(row.id);
  // Only once it is really gone: a cancelled or failed attempt keeps its own trigger.
  removed.current = index;
};

const focusAfterRemove = () => {
  const index = removed.current;
  removed.current = undefined;
  if (index === undefined) {
    return null; // null keeps the default — the trigger, which is still there
  }
  const next = rows[Math.min(index, rows.length - 1)] ?? anchorRow;
  return (next && triggers.current.get(next.id)) ?? null;
};
```

Prefer the row that took the removed one's place, the last row when it was the
last, and a control that outlives the list once it is empty.

Test the removal, not just the cancel: `toHaveFocus()` on the row that should
have caught it. A suite that only asserts focus after cancelling passes while
every successful removal drops focus on the floor.

## Testing

A view is covered by its feature's integration test, not a test of its own. See
`testing.md`. Wrap anything you render in `<MosaicProvider>`: it supplies the
icon-override and localization context, and keeps the test tree matching
production.

See `references/mosaic-architecture.md` → "Views" for the layer contract.
