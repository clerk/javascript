---
"@clerk/tanstack-react-start": minor
---

Reuses existing `Auth` object from the server handler when using `getAuth()`

The `createClerkHandler` helper now returns a Promise and requires awaiting during setup to ensure authentication context is available at the earliest possible point in the request lifecycle, before any router loaders or server functions execute

```ts
// server.ts
import { createStartHandler, defineHandlerCallback, defaultStreamHandler } from '@tanstack/react-start/server';
import { createRouter } from './router';
import { createClerkHandler } from '@clerk/tanstack-react-start/server';

const handlerFactory = createClerkHandler(
  createStartHandler({
    createRouter,
  }),
);

export default defineHandlerCallback(async event => {
  const startHandler = await handlerFactory(defaultStreamHandler); // awaited
  return startHandler(event);
});
```
