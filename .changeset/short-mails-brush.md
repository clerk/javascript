---
'@clerk/elements': patch
---

Add Elements `<Link />` component.

```tsx
import * as Clerk from '@clerk/elements/common';
import NextLink from 'next/link';

function SignInPage() {
  return (
    <>
      <Clerk.Link navigate='sign-up'>Sign up</Clerk.Link>

      <Clerk.Link navigate='sign-up'>{url => <NextLink href={url}>Sign up</NextLink>}</Clerk.Link>
    </>
  );
}
```
