# @clerk/form

Reactive form primitives for Clerk SDKs — a [TanStack Form](https://tanstack.com/form)-style API whose reactive core is [nanostores](https://github.com/nanostores/nanostores) instead of `@tanstack/store`.

- **Typed field paths** via nanostores' `AllPaths`/`FromPath` (`'email'`, `'friends[0].name'`).
- **Validation** with plain functions _or_ any [Standard Schema](https://standardschema.dev) (zod 3.24+, valibot, arktype).
- **Async validation** tracked by nanostores `task()` (so tests can `await allTasks()`).
- **Minimal re-renders** in React via selector-based subscriptions.

> [!NOTE]
> Form data must be an object-literal `type`, not an `interface`. nanostores' path types require `Record<string, unknown>`, which only object-literal types satisfy (interfaces lack the implicit index signature).

## Core

```ts
import { createForm, createField } from '@clerk/form';

type Values = { email: string; friends: { name: string }[] };

const form = createForm<Values>({
  defaultValues: { email: '', friends: [] },
  validators: {
    // form-level validator may target individual fields
    onChange: ({ value }) => (value.email ? undefined : { fields: { email: 'Required' } }),
  },
  onSubmit: async ({ value }) => {
    await api.save(value);
  },
});

const email = createField(form, {
  name: 'email',
  validators: { onChange: ({ value }) => (value.includes('@') ? undefined : 'Invalid email') },
});

email.handleChange('a@b.c'); // setValue + runs change validation
email.handleBlur(); // marks touched + runs blur validation
email.state.value; // 'a@b.c'
email.state.meta.errors; // string[]

form.state.canSubmit; // derived: !isSubmitting && isValid
await form.handleSubmit();
```

### Validation

Each validator slot is a function or a Standard Schema. Async slots are debounced and cancel in-flight runs:

```ts
import { z } from 'zod';

createField(form, {
  name: 'username',
  validators: {
    onChange: z.string().min(3), // Standard Schema
    onChangeAsync: async ({ value, signal }) => {
      const taken = await checkUsername(value, signal);
      return taken ? 'Taken' : undefined;
    },
    onChangeAsyncDebounceMs: 300,
  },
});
```

Cross-field validation via `listenTo`:

```ts
createField(form, {
  name: 'confirm',
  validators: {
    onChange: ({ value, fieldApi }) => (value === fieldApi.form.getFieldValue('password') ? undefined : 'Mismatch'),
    onChangeListenTo: ['password'], // re-validate when `password` changes
  },
});
```

### Arrays

Array operations are standalone, tree-shakeable functions (nanostores-style — free functions over the store). Import only what you use; the base form does not bundle them.

```ts
import { pushFieldValue, insertFieldValue, removeFieldValue, swapFieldValues, moveFieldValues } from '@clerk/form';

pushFieldValue(form, 'friends', { name: '' });
insertFieldValue(form, 'friends', 0, { name: 'Sam' });
removeFieldValue(form, 'friends', 1);
swapFieldValues(form, 'friends', 0, 1);
moveFieldValues(form, 'friends', 0, 2);
```

## React

```tsx
import { useForm } from '@clerk/form/react';

function SignupForm() {
  const form = useForm<Values>({ defaultValues: { email: '', friends: [] }, onSubmit });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name='email'
        validators={{ onChange: z.string().email() }}
      >
        {field => (
          <>
            <input
              value={field.state.value}
              onChange={e => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors[0] && <span>{field.state.meta.errors[0]}</span>}
          </>
        )}
      </form.Field>

      {/* re-renders only when `canSubmit` changes */}
      <form.Subscribe selector={s => s.canSubmit}>
        {canSubmit => (
          <button
            type='submit'
            disabled={!canSubmit}
          >
            Save
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
```

`useField`, `useStore` (a selector-aware `useSyncExternalStore` adapter), and `createFormHook` / `createFormHookContexts` (for app-level pre-wired field/form components) are also exported from `@clerk/form/react`.

## Field groups

Project a typed subset of the form as a self-contained section:

```ts
import { createFieldGroup } from '@clerk/form';

const address = createFieldGroup({ form, fields: 'address' }); // prefix form
address.setFieldValue('street', 'Main St'); // -> form 'address.street'

// or an explicit map
const group = createFieldGroup({ form, fields: { street: 'billing.street' } });
```
