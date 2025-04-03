<!-- Start SDK Example Usage [usage] -->
```typescript
import { Clerk } from "@clerk/backend-api-client";

const clerk = new Clerk();

async function run() {
  await clerk.miscellaneous.getPublicInterstitial({});
}

run();

```
<!-- End SDK Example Usage [usage] -->