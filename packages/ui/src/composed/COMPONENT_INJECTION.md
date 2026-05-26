# Component Injection

Pass custom primitive components to `<ClerkProvider>` to replace Clerk's built-in UI primitives across all Clerk components.

## Usage

```tsx
import { ClerkProvider } from '@clerk/nextjs'

<ClerkProvider
  publishableKey={...}
  components={{
    button: MyButton,
    input: MyInput,
    alert: MyAlert,
  }}
>
  <App />
</ClerkProvider>
```

Every Clerk component (`<SignIn />`, `<UserProfile />`, `<OrganizationProfile />`, composed components, modals, drawers) will use your components instead of Clerk's defaults.

## Available slots

| Slot      | What it replaces                                                       | Element type |
| --------- | ---------------------------------------------------------------------- | ------------ |
| `button`  | All buttons (primary actions, secondary actions, social buttons, etc.) | `<button>`   |
| `input`   | Text inputs, checkboxes, radio buttons                                 | `<input>`    |
| `alert`   | Inline alerts and error banners                                        | `<div>`      |
| `spinner` | Loading spinners                                                       | `<span>`     |
| `badge`   | Status badges and tags                                                 | `<span>`     |

## Props your components receive

Custom components receive **standard HTML attributes only** — no Clerk-specific prop interfaces. This means any component library works out of the box.

### Button

Your button component receives standard `React.ButtonHTMLAttributes<HTMLButtonElement>` plus data attributes for Clerk's internal state:

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Standard HTML — set automatically by Clerk:
  disabled?: boolean; // true when loading or explicitly disabled
  'aria-busy'?: boolean; // true when loading

  // Data attributes — use for conditional styling:
  'data-variant'?: 'solid' | 'outline' | 'ghost' | 'link' | 'linkDanger';
  'data-color'?: 'primary' | 'secondary' | 'neutral' | 'danger';
  'data-loading'?: ''; // present when loading

  children?: React.ReactNode;
}
```

**Example with shadcn/ui:**

```tsx
import { Button } from '@/components/ui/button';

<ClerkProvider
  components={{
    button: props => {
      const variant =
        props['data-variant'] === 'outline'
          ? 'outline'
          : props['data-variant'] === 'ghost'
            ? 'ghost'
            : props['data-variant'] === 'link'
              ? 'link'
              : 'default';

      const destructive = props['data-color'] === 'danger';

      return (
        <Button
          {...props}
          variant={destructive ? 'destructive' : variant}
        />
      );
    },
  }}
/>;
```

### Input

Standard `React.InputHTMLAttributes<HTMLInputElement>`:

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  disabled?: boolean;
  required?: boolean;
  'aria-invalid'?: boolean; // true when field has an error
  'aria-required'?: boolean;
  'data-variant'?: 'default';
}
```

**Example with shadcn/ui:**

```tsx
import { Input } from '@/components/ui/input';

<ClerkProvider
  components={{
    input: props => <Input {...props} />,
  }}
/>;
```

### Alert

Standard `React.HTMLAttributes<HTMLDivElement>`:

```tsx
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-color'?: 'danger' | 'info' | 'warning';
  children?: React.ReactNode;
}
```

### Spinner

```tsx
interface SpinnerProps extends React.HTMLAttributes<HTMLElement> {
  'aria-busy'?: boolean;
  'aria-label'?: string;
}
```

### Badge

```tsx
interface BadgeProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}
```

## Styling

Custom components **bypass Clerk's appearance system entirely**. No Clerk CSS classes or emotion styles are applied. Your component is fully responsible for its own styling.

If you need to conditionally style based on Clerk's state, use the `data-*` attributes:

```css
/* Style a custom button based on Clerk's variant */
[data-variant='solid'] {
  background: var(--primary);
  color: white;
}
[data-variant='outline'] {
  border: 1px solid var(--border);
}
[data-variant='ghost'] {
  background: transparent;
}

/* Style based on color */
[data-color='danger'] {
  background: var(--destructive);
}

/* Loading state */
[data-loading] {
  opacity: 0.7;
  cursor: wait;
}
```

## Partial replacement

You only need to provide the slots you want to replace. Unspecified slots use Clerk's defaults:

```tsx
// Only replace buttons — inputs, alerts, etc. stay as Clerk defaults
<ClerkProvider
  components={{
    button: MyButton,
  }}
/>
```

## Loading states

When Clerk sets a button to loading, your custom button receives:

- `disabled={true}`
- `aria-busy={true}`
- `data-loading=""`

Your button is responsible for rendering its own loading indicator (spinner, skeleton, etc.). Clerk's built-in spinner is not injected into custom buttons.

```tsx
const MyButton = React.forwardRef((props, ref) => {
  const isLoading = props['aria-busy'];

  return (
    <button
      {...props}
      ref={ref}
    >
      {isLoading && <MySpinner />}
      {props.children}
    </button>
  );
});
```

## Ref forwarding

Custom components should forward refs for focus management and accessibility to work correctly:

```tsx
const MyInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input
    {...props}
    ref={ref}
    className='my-input'
  />
));
```

## What is NOT replaceable

- **Layout primitives** (`Box`, `Flex`, `Grid`) — these are structural, not user-facing
- **Typography** (`Text`, `Heading`, `Link`) — use the `appearance` prop for text styling
- **Cards, Modals, Drawers** — use the `appearance` prop for container styling
- **Section-level components** — the composed API (`UserProfile.AccountEmails`, etc.) handles section customization
