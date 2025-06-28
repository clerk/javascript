# UpdateInstanceRestrictionsRequestBody

## Example Usage

```typescript
import { UpdateInstanceRestrictionsRequestBody } from "@clerk/backend-api-client/models/operations";

let value: UpdateInstanceRestrictionsRequestBody = {};
```

## Fields

| Field                         | Type                          | Required                      | Description                   |
| ----------------------------- | ----------------------------- | ----------------------------- | ----------------------------- |
| `allowlist`                   | *boolean*                     | :heavy_minus_sign:            | N/A                           |
| `blocklist`                   | *boolean*                     | :heavy_minus_sign:            | N/A                           |
| `blockEmailSubaddresses`      | *boolean*                     | :heavy_minus_sign:            | N/A                           |
| `blockDisposableEmailDomains` | *boolean*                     | :heavy_minus_sign:            | N/A                           |
| `ignoreDotsForGmailAddresses` | *boolean*                     | :heavy_minus_sign:            | N/A                           |