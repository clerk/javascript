# Views

The view renders a snapshot and emits events. Nothing else.

- **No Clerk imports.** No data-fetching hooks. No mutation calls. Everything the
  view needs arrives as explicit props from the controller (`controllers.md`).
- **Branch on `snapshot.value`, not on context booleans.** The machine models
  the states; the view reads them.
- **Take derived booleans from the controller.** `actor.can(...)` results (e.g.
  `canSubmit`) are passed in — the view never re-implements a machine guard.

```tsx
<Destructive
  open={snapshot.value === 'confirming' || snapshot.value === 'deleting'}
  resourceName={snapshot.context.organizationName}
  confirmationValue={snapshot.context.confirmationValue}
  onConfirmationValueChange={value => send({ type: 'TYPE_CONFIRMATION', value })}
  onDelete={() => send({ type: 'CONFIRM' })}
  canSubmit={canSubmit}
  isDeleting={snapshot.value === 'deleting'}
  error={snapshot.context.error}
/>
```

## Testing

Render the view directly with a **fake snapshot and a fake `send`**. No Clerk
providers, no Clerk fixtures. Because the view is pure rendering, a test can
assert "state X renders element Y and clicking Z sends event W" for every branch
of `snapshot.value` without any of the flow or data machinery.

See `references/mosaic-architecture.md` → "Views" for the layer contract.
