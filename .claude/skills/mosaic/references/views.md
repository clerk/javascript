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

## Testing

Render the view directly with **plain props and `vi.fn()` callbacks**. No Clerk
providers, no fixtures, no machine. **Wrap in `<MosaicProvider>`** — it is not a
Clerk provider; it supplies the icon-override context, and wrapping keeps the
test tree matching production. See `testing.md`.

See `references/mosaic-architecture.md` → "Views" for the layer contract.
