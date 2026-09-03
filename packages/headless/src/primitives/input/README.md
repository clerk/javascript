# Input

An unstyled native input primitive for standalone fields and compound controls. It supports the shared `render` escape hatch and reflects native state through `data-disabled`, `data-invalid`, and `data-readonly` attributes for styling.

```tsx
import { Input } from '@clerk/headless/input';

<Input
  aria-label='Domain'
  placeholder='example.com'
/>;
```
