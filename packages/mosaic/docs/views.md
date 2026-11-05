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
export function SwitcherView({ open, onOpenChange, pendingKey, onSignOutAll, ...data }: SwitcherViewProps) {
  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
    >
      {onSignOutAll ? (
        <Item
          onClick={onSignOutAll}
          busy={pendingKey === switcherBusyKeys.signOutAll()}
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
  function of props (`switcher.tsx`).
- A **leaf view owns its controller** and takes the effect as a prop
  (`UserProfileUsernameRowView` calls `useUserProfileEditUsernameController`
  with its `onSubmit`). Still no Clerk — the effect arrives from above.

## Moving between screens on one surface

When one screen replaces another on the same card or dialog, render both as steps
of `Flow` (`components/flow`). The surface stays put, its height animates, and the
outgoing screen stays mounted until its exit finishes. A conditional or an early
return makes the new screen pop in instead.

```tsx
<Card.Root renderBranding={renderBranding}>
  <Flow.Root
    value={step}
    direction={step === 'list' ? -1 : 1}
    state={props}
  >
    {current => (
      <>
        <Flow.Step ids={['list']}>
          <ListStep {...current} />
        </Flow.Step>
        <Flow.Step ids={['create']}>
          <CreateStep {...current} />
        </Flow.Step>
      </>
    )}
  </Flow.Root>
</Card.Root>
```

- **The surface sits outside the flow, and a step renders only what goes inside
  it.** A screen used as a step of another feature cannot bring its own `Card.Root`.
  `ConfirmShell` owns the card and `Reverification` renders only its contents.
- **One flow per surface.** A step that has steps of its own adds them to the same
  flow, so the view renders one `Flow.Root`.
- **The controller owns the step.** Going back is direction `-1`. Derive it from the
  step when each step has one way in, and hold it in the controller when it does not
  (`reverification.controller.ts`).
- **Mark what takes focus with `useFlowAutoFocus`.** Focus moves only for a step
  that transitions in, so a flow that opens on a step does not take focus.
- **A multi-step flow gets derived props.** The view renders the `step`, `form`
  and flags the controller passes and does not work out the step itself. Every
  step's `Form` uses `id={form.id}` and the controller's `onSubmit`, and its
  footer action is a `SubmitButton` with `form={form.id}`. A middle step sets
  `isPending={isTesting}` and `disabled={!canContinue}`, and the last sets
  `isPending={form.isSubmitting}` and `disabled={!form.canSubmit}`. The
  controller side is in `controllers.md` → "Multi-step flows".

A loading or error state of a single screen is not a step, and neither is the
skeleton shown before a feature has data. Those can stay conditionals.

The parts, data attributes and CSS variables are in
`src/primitives/flow/README.md`.

### Who renders `Card.Root`

Only the part that creates the surface renders `Card.Root`, and cards do not nest.

| Layer   | Renders                                                        | Example                   |
| ------- | -------------------------------------------------------------- | ------------------------- |
| Surface | `Card.Root`, inside a dialog or popover when there is one      | `CreateOrganizationView`  |
| Steps   | `Flow.Root` and its steps, no card                             | `CreateOrganizationSteps` |
| Screen  | `Card.Header`, `Card.Banner`, `Card.Content` and `Card.Footer` | A step of the flow        |

A feature's skeleton is a surface too. A feature that another feature can embed
exports its steps, and its view is `Card.Root` around them.

Chrome that stays across steps goes under the surface, outside the flow. A step's
`Card.Footer` must be a sibling of its `Card.Content`, so a step on a surface with a
shared footer puts its submit button in `Card.Content` (`waitlist.view.tsx`).

## Forms on a card

The controller owns the form with `useForm`, including what `canSubmit` allows, and
passes `form` to the view. The view does not check values, call `preventDefault` or
create the form's id. This applies when you add or rewrite a form. Some existing forms
predate it.

```tsx
function EditNameStep({ form, messages, onCancel }: EditNameStepProps) {
  const { feedback } = form.fields.name;

  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {form.error}
      </Card.Banner>
      <Card.Content
        render={
          <Form
            id={form.id}
            onSubmit={form.handleSubmit}
          />
        }
      >
        <Field.Root
          disabled={form.isSubmitting}
          invalid={feedback?.type === 'error'}
        >
          <Field.Label>{messages.label}</Field.Label>
          <Input {...form.register('name')} />
          <Field.Feedback feedback={feedback} />
        </Field.Root>
      </Card.Content>
      <Card.Footer>
        <Button
          variant='outline'
          color='neutral'
          fullWidth
          disabled={form.isSubmitting}
          onClick={onCancel}
        >
          {messages.cancel}
        </Button>
        <SubmitButton
          form={form.id}
          fullWidth
          isPending={form.isSubmitting}
          disabled={!form.canSubmit}
          focusableWhenDisabled
        >
          {messages.save}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
```

- **Errors:** a form-level error goes in `Card.Banner`, and a field error in
  `Field.Feedback`.
- **Focus:** `initialFocus` on `Dialog.Popup` covers the step a dialog opens on, and
  `useFlowAutoFocus` covers each step entered after it. A field that can be either uses
  both.
- **Closing while pending:** the controller's `onOpenChange` ignores the close, and the
  view does not guard it again.
- **No values to submit:** a step with no values does not need `useForm`
  (`CopyKeyStep` uses `Form` only so Enter copies the key).

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
use, and takes the rest as props. There are three:

- `blocks/destructive` (`Destructive`) holds the half-typed confirmation phrase
  and compares it.
- `blocks/confirmation` (`Confirmation`) is a confirm step with no typed phrase.
- `blocks/avatar-upload` (`AvatarUpload`) is an avatar or logo picker. Its parts
  share the file input, so the caller places them in its own layout.

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
