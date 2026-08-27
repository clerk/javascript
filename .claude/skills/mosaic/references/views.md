# Views

The view renders a snapshot and emits events. Nothing else.

- **No Clerk imports.** No data-fetching hooks. No mutation calls. Everything the
  view needs arrives as explicit props from the controller (`controllers.md`).
- **Branch on `snapshot.value`, not on context booleans.** The machine models
  the states; the view reads them.
- **Take derived booleans from the controller.** `actor.can(...)` results (e.g.
  `canSubmit`) are passed in — the view never re-implements a machine guard.

```tsx
<Form onSubmit={() => send({ type: 'SUBMIT' })}>
  <Input
    value={snapshot.context.name}
    disabled={snapshot.value === 'saving'}
    onChange={event => send({ type: 'TYPE_NAME', value: event.target.value })}
  />
  <SubmitButton
    isPending={snapshot.value === 'saving'}
    disabled={!canSubmit}
  >
    Save
  </SubmitButton>
</Form>
```

A **block** takes the flow's state as props. It owns only what nothing outside
it can use. `Destructive` is the example: it holds the half-typed confirmation
phrase and compares it, while `open`, `isDeleting`, and `errorMessage` come from
the machine, because those are what decide whether the dialog closes or explains
itself.

```tsx
<Destructive
  open={snapshot.value === 'confirming' || snapshot.value === 'deleting'}
  onOpenChange={open => send({ type: open ? 'OPEN' : 'CANCEL' })}
  trigger={<Button color='negative'>Delete organization</Button>}
  title='Delete organization?'
  description="All of this organization's data will be permanently deleted."
  fieldLabel='Type the organization name below to continue'
  confirmationValue={organizationName}
  actionLabel='Delete organization'
  onDelete={() => send({ type: 'CONFIRM' })}
  isDeleting={snapshot.value === 'deleting'}
  errorMessage={snapshot.context.errorMessage}
/>
```

## Testing

Render the view directly with a **fake snapshot and a fake `send`**. No Clerk
providers, no Clerk fixtures. Because the view is pure rendering, a test can
assert "state X renders element Y and clicking Z sends event W" for every branch
of `snapshot.value` without any of the flow or data machinery.

See `references/mosaic-architecture.md` → "Views" for the layer contract.
