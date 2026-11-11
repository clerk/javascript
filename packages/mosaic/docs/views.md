# Views

Read this when you write or change a `*.view.tsx`, a dialog or step a view renders, or the copy a feature shows. It covers rendering, screens on one surface, forms, strings and blocks; how a view is composed with its model and controller is in [Features](features.md#composition).

Worked example: `src/features/switcher/switcher.view.tsx`.

## Rules

- No Clerk imports, no data-fetching hooks, no mutation calls.
- No machine snapshot. The controller derives the props the view branches on (`open`, `pendingKey`, `isDeleting`, `errorMessage`), so the view never reads `snapshot.value` or calls `send`.
- An absent callback hides the affordance it drives. The model says "this instance does not offer this" by omitting the callback, so the view checks `onSignOutAll ? … : null`, not a capability flag.
- Take derived booleans from the controller. The view never re-implements a machine guard or works out whether an action is allowed.
- Every string comes from the feature's `*.messages.ts`, read with `useMessages`. Never import a `*.messages.ts` directly: that skips the customer's locale and overrides.
- Pure derivation (which affordance lands in which slot, how a consumer's `order` array rearranges a list) has no React in it. It lives in `*.layout.ts` or `*.utils.ts` with its own tests, and the view calls the result.

## Moving between screens on one surface

When one screen replaces another on the same card or dialog, render both as steps of `Flow` (`src/components/flow/`). The surface stays put, its height animates, and the outgoing screen stays mounted until its exit finishes. A conditional or an early return makes the new screen pop in instead.

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

- **The surface sits outside the flow, and a step renders only what goes inside it.** A screen used as a step of another feature cannot bring its own `Card.Root`: `ConfirmShell` owns the card and `Reverification` renders only its contents.
- **One flow per surface.** A step that has steps of its own adds them to the same flow, so the view renders one `Flow.Root`.
- **The controller owns the step.** Going back is direction `-1`. Derive it from the step when each step has one way in, and hold it in the controller when it does not (`reverification.controller.ts`).
- **Mark what takes focus with `useFlowAutoFocus`.** Focus moves only for a step that transitions in, so a flow that opens on a step does not take focus.
- **A multi-step flow gets derived props.** The view renders the `step`, `form` and flags the controller passes and does not work out the step itself. Every step's `Form` uses `id={form.id}` and the controller's `onSubmit`, and its footer action is a `SubmitButton form={form.id}`: `isPending={isTesting}` and `disabled={!canContinue}` on a middle step, `isPending={form.isSubmitting}` and `disabled={!form.canSubmit}` on the last. The controller side is in [Controllers → Multi-step flows](controllers.md#multi-step-flows).
- A loading or error state of one screen is not a step, and neither is the skeleton shown before a feature has data. Those stay conditionals.

The parts, data attributes and CSS variables are in `src/primitives/flow/README.md`.

### Who renders `Card.Root`

Only the part that creates the surface renders `Card.Root`, and cards do not nest.

| Layer   | Renders                                                        | Example                   |
| ------- | -------------------------------------------------------------- | ------------------------- |
| Surface | `Card.Root`, inside a dialog or popover when there is one      | `CreateOrganizationView`  |
| Steps   | `Flow.Root` and its steps, no card                             | `CreateOrganizationSteps` |
| Screen  | `Card.Header`, `Card.Banner`, `Card.Content` and `Card.Footer` | A step of the flow        |

A feature's skeleton is a surface too. A feature another feature can embed exports its steps, and its view is `Card.Root` around them.

Chrome that stays across steps goes under the surface, outside the flow. A step's `Card.Footer` must be a sibling of its `Card.Content`, so a step on a surface with a shared footer puts its submit button in `Card.Content` (`waitlist.view.tsx`).

## Forms on a card

The controller owns the form with `useForm`, including what `canSubmit` allows, and passes `form` to the view whole. The view does not check values, call `preventDefault` or create the form's id. Worked example: `organization-profile-edit-name.dialog.tsx`.

- **Wiring:** `Card.Content render={<Form id={form.id} onSubmit={form.handleSubmit} />}` holds the fields, and `Card.Footer` holds the cancel `Button` and a `SubmitButton form={form.id}` with `isPending={form.isSubmitting}`, `disabled={!form.canSubmit}` and `focusableWhenDisabled`.
- **Fields:** `Field.Root` takes `disabled={form.isSubmitting}` and `invalid` from the field's feedback, and the input spreads `form.register(name)`.
- **Errors:** a form-level error goes in `Card.Banner role='alert'`, and a field error in `Field.Feedback`.
- **Focus:** `initialFocus` on `Dialog.Popup` covers the step a dialog opens on, and `useFlowAutoFocus` covers each step entered after it. A field that can be either uses both.
- **Closing while pending:** the controller's `onOpenChange` ignores the close, and the view does not guard it again.
- **No values to submit:** a step with no values does not need `useForm` (`CopyKeyStep` uses `Form` only so Enter copies the key).

## Where the strings live

Each feature's strings are one `<feature>Messages` object declared `as const` in its `*.messages.ts`, shaped the way `@clerk/i18n` takes a base definition: a plural message is its forms, a parameterized one is its template.

To add copy for a new section, step or dialog:

1. Put the strings in the `*.messages.ts` next to the view that renders them. Name each key for what the string is (`label`, `resend`, `confirm`), not where it sits in the markup.
2. Mount the object in `src/localization/registry.ts` under the public component the user sees it in (see the key tree below).
3. Read it inside the component that renders it, with `useMessages` and the root: `const m = useMessages('userProfile').mfa;`. A module-level helper takes the messages as a parameter rather than importing them.

### Message keys are public

`MosaicCatalog` is derived from the registry, so a consumer's overrides type-check against the real keys, as a dot path (`'userButton.popup.label'`) or a nested object. Renaming or moving a key breaks every override that names it; treat it like renaming a prop.

The key tree follows what the user sees, so a key can be found from the screen:

- A root is a public component (`userProfile`) or a shared block (`form`, `errors`), never a file name. There is no `common` root: the same English in two components is two keys, because a translation may need to differ by context.
- Below the root, keys nest by section, then by the dialog or step inside it: `userProfile.email.addDialog`, `userProfile.email.removeDialog`.
- Copy that several views render through one shared component belongs to that component (`userProfile.contact` for the row email and phone share).
- Every segment is camelCase. A map keyed by data ids (`errors`, `roles`, `userProfile.mfa.methods`) keeps the ids as its keys. `src/localization/__tests__/registry.test.ts` lists those maps and checks the rest.

### Resolving a string

`MosaicProvider` takes `localization={{ locale, messages, overrides }}`: `messages` is the catalog for `locale`, `overrides` is the app's own changes on top, and English sits under both. `locale` feeds `Intl.PluralRules` and `Intl.NumberFormat` in the string helpers, and `useLocale()` exposes it to feature code that formats dates and relative times (`user-profile-active-devices-section.model.ts`).

Resolve strings with the helpers in `src/localization/messages.ts`, never with `.replace` or `.split`:

- `fill(m.trigger.open, { name })` substitutes `{name}` placeholders.
- `plural(m.members, count, locale)` picks a form with `Intl.PluralRules` for the `locale` from `useLocale()` and fills `{count}`.
- `rich(m.description, { values, components })` renders `{#strong}…{/strong}` markup through the component given for that tag, so the sentence stays in the messages file. Markup is for inline emphasis a translator may keep or move. A wrapper the view needs for its own purposes, such as a countdown span, goes in `values` as an element, so the string only sees `{seconds}`.

Each helper is typed from the string: `fill` accepts exactly its placeholders, `rich` exactly its tags, and `plural` whatever the forms name besides `count`.

## Blocks

A block is a view fragment that owns one piece of state nothing outside it can use, and takes the rest as props:

- `blocks/destructive` (`Destructive`) holds the half-typed confirmation phrase and compares it.
- `blocks/confirmation` (`Confirmation`) is a confirm step with no typed phrase.
- `blocks/avatar-upload` (`AvatarUpload`) is an avatar or logo picker. Its parts share the file input, so the caller places them in its own layout.
- `blocks/verification` holds the steps that verify a factor, such as `VerificationCode`. Each renders the inside of a card and takes its copy as `messages`, so reverification and sign-in show them with their own strings.

`Destructive` and `Confirmation` take a `controller` from `useConfirmController` (`blocks/confirm/`), which decides whether the dialog closes or explains itself. The hook runs in the wrapper or controller, never in the view. A dialog next to its button takes the button as `trigger`:

```tsx
<Destructive
  controller={deleteAccount}
  trigger={<Button color='negative'>{m.actionLabel}</Button>}
  title={m.dialogTitle}
  confirmationValue={m.fieldPlaceholder}
/>
```

When one dialog serves every row in a list, the controller carries the row as its payload. Mount the block once after the list, open it from a row with `controller.open(row)`, and derive the copy from the payload; `onConfirm` in the wrapper receives the same row:

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

When the confirmed action removes the row its trigger sits on, the view registers each row's trigger with the `registerTrigger` it is given and passes `finalFocus` to the block. The rest is in [Controllers → Removing a row takes focus with it](controllers.md#removing-a-row-takes-focus-with-it).

## Testing

The feature test covers the view's behavior (roles, labels, focus). Its visual states are Swingset stories with plain props ([Testing](testing.md)).
