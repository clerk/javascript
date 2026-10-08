# Views

The view renders plain props and calls plain callbacks. Nothing else.

- **No Clerk imports.** No data-fetching hooks. No mutation calls.
- **No machine snapshot.** The controller (`controllers.md`) derives the props
  the view branches on — `open`, `pendingKey`, `isDeleting`, `errorMessage` — so
  the view never reaches into `snapshot.value` or calls `send`.
- **An absent callback hides the affordance it drives.** The model expresses "the
  instance does not offer this" by omitting the callback, so the view's check is
  a plain `? :` rather than a capability flag of its own.
- **Take derived booleans from the controller.** The view never re-implements a
  machine guard or works out for itself whether an action is allowed.

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
          {m.accounts.signOutAll}
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
  (`UserProfileUsernameRowView` calls `useUserProfileEditUsernameController`
  with its `onSubmit`). Still no Clerk — the effect arrives from above.

## Where the strings live

Every string a view renders comes from the feature's `*.messages.ts`, shaped the
way `@clerk/i18n` takes a base definition. A plural message is its forms; a
parameterized one is its template.

Register the file as a namespace in `src/localization/registry.ts`, then read it
with `useMessages` in the view or controller that renders it:

```tsx
const m = useMessages('userButton');
```

Never import a `*.messages.ts` directly. A direct import skips the customer's
locale and overrides, so the copy can't be localized.

## Blocks

A **block** is a view fragment that owns one piece of state nothing outside it can
use, and takes the rest as props. There are two:

- `blocks/destructive` (`Destructive`) holds the half-typed confirmation phrase
  and compares it.
- `blocks/confirmation` (`Confirmation`) is a confirm step with no typed phrase.

`open`, the pending flag and `errorMessage` come from the block's own controller
(`useDestructiveController`, `useConfirmationController`), because those decide
whether the dialog closes or explains itself. Spread the controller onto the
block rather than wiring that state by hand:

```tsx
const destructive = useDestructiveController({ onDelete, reverification });

<Destructive
  {...destructive}
  trigger={<Button color='negative'>{m.actionLabel}</Button>}
  title={m.dialogTitle}
  confirmationValue={m.fieldPlaceholder}
/>;
```

When one dialog serves every row in a list, use the handle form: create a handle
with `Confirmation.createHandle<Row>()` (or `Destructive.createHandle`), pass it
to each row's trigger and to the block's `handle` prop, and the clicked row
arrives as the payload of `onConfirm` / `onDelete`. In this form the block runs
its own controller, so pass the effect and `errorFallback` straight to it.
`user-profile-mfa-section.view.tsx` and `api-keys-table.view.tsx` are worked
examples.

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

Hand focus to a surviving element with `useListRemovalFocus` (`hooks/`). It
records which row was removed and, through `finalFocus`, picks the row that took
its place, the last row when it was the last, or `fallback()` once the list is
empty. `finalFocus` on `Dialog.Popup` and on the `Confirmation` block takes a
function resolved when the dialog closes, after the row has gone:

```tsx
const removalFocus = useListRemovalFocus({
  ids: methods.map(method => method.id),
  onRemove,
  fallback: () => section.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ?? section.current,
});

// each row's trigger
triggerRef={removalFocus.registerTrigger(method.id)}

// the dialog
finalFocus={removalFocus.finalFocus}
onConfirm={method => removalFocus.remove(method.id)}
```

A cancelled or failed removal keeps its own trigger, so `finalFocus` returns
`null` and the dialog's default (the trigger) applies.

Prefer the row that took the removed one's place, the last row when it was the
last, and a control that outlives the list once it is empty.

Test the removal, not just the cancel: `toHaveFocus()` on the row that should
have caught it. A suite that only asserts focus after cancelling passes while
every successful removal drops focus on the floor.

## Testing

The view's behavior (roles, labels, focus) is covered by the feature test. Its
visual states are swingset stories with plain props. See `testing.md`.

See `packages/mosaic/ARCHITECTURE.md` → "Views" for the layer contract.
