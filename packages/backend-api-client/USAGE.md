<!-- Start SDK Example Usage [usage] -->
```typescript
import { ClerkBackendApi } from "@clerk/backend-api-client";

const clerkBackendApi = new ClerkBackendApi();

async function run() {
  await clerkBackendApi.miscellaneous.getPublicInterstitial({});
}

run();

```
<!-- End SDK Example Usage [usage] -->