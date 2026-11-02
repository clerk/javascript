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

To add copy for a new section, step or dialog:

1. Put the strings in the `*.messages.ts` next to the view that renders them. Name
   each key for what the string is (`label`, `resend`, `confirm`), not where it
   sits in the markup.
2. Mount the object in `src/localization/registry.ts` under the public component
   the user sees it in: a section of `UserProfile` goes at `userProfile.<section>`,
   and a dialog inside it at `userProfile.<section>.addDialog` or `.removeDialog`.
   Copy two views share goes under the component that renders it, never under a
   new `common` root.
3. Read it with `useMessages` and the root, in the view or controller that
   renders it:

```tsx
const m = useMessages('userProfile').mfa;
```

The rules behind these steps are in [ARCHITECTURE.md](../ARCHITECTURE.md), and
`src/localization/__tests__/registry.test.ts` fails on a key that is not camelCase.

Never import a `*.messages.ts` directly. A direct import skips the customer's
locale and overrides, so the copy can't be localized.

## Blocks

A **block** is a view fragment that owns one piece of state nothing outside it can
use, and takes the rest as props. There are two:

- `blocks/destructive` (`Destructive`) holds the half-typed confirmation phrase
  and compares it.
- `blocks/confirmation` (`Confirmation`) is a confirm step with no typed phrase.

Both take a `controller` from `useConfirmController` (`blocks/confirm/`), which
decides whether the dialog closes or explains itself. The hook runs in the
wrapper or controller, never in the view; the view receives the controller as a
prop. A dialog next to its button takes the button as `trigger`:

```tsx
<Destructive
  controller={deleteAccount}
  trigger={<Button color='negative'>{m.actionLabel}</Button>}
  title={m.dialogTitle}
  confirmationValue={m.fieldPlaceholder}
/>
```

When one dialog serves every row in a list, the controller carries the row as
its payload. Mount the block once after the list, open it from a row with
`controller.open(row)`, and derive the copy from the payload. `onConfirm` in the
wrapper receives the same row. See "Removing a row takes focus with it" in
`controllers.md` for the focus hand-off that comes with a removal:

```tsx
<ActionMenu actions={[{ label: m.remove, onClick: () => remove.open(row) }]} />

<Confirmation
  controller={remove}
  title={member => fill(m.removeTitle, { name: member.name })}
  description={m.removeDescription}
  actionLabel={m.remove}
  finalFocus={finalFocus}
/>
```

## Pure derivation belongs beside the view, not in it

Which affordance lands in which slot, and how a consumer's `order` array
rearranges a list, are decisions with no React in them. They live in
`*.layout.ts` / `*.utils.ts` and get their own tests — the view calls the result.

## Removing a row takes focus with it

When a confirmed action removes the row its trigger sits on, focus has to be
handed to a surviving element. The bookkeeping lives in the controller, with
`useListRemovalFocus`; see `controllers.md`. The view's part is to register each
row's trigger with the `registerTrigger` it is given and pass `finalFocus` to the
block.

## Testing

The view's behavior (roles, labels, focus) is covered by the feature test. Its
visual states are swingset stories with plain props. See `testing.md`.

See `packages/mosaic/ARCHITECTURE.md` → "Views" for the layer contract.
