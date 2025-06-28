# ClerkError

## Example Usage

```typescript
import { ClerkError } from "@clerk/backend-api-client/models/components";

let value: ClerkError = {
  message: "<value>",
  longMessage: "<value>",
  code: "<value>",
};
```

## Fields

| Field                                              | Type                                               | Required                                           | Description                                        |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| `message`                                          | *string*                                           | :heavy_check_mark:                                 | N/A                                                |
| `longMessage`                                      | *string*                                           | :heavy_check_mark:                                 | N/A                                                |
| `code`                                             | *string*                                           | :heavy_check_mark:                                 | N/A                                                |
| `meta`                                             | [components.Meta](../../models/components/meta.md) | :heavy_minus_sign:                                 | N/A                                                |
| `clerkTraceId`                                     | *string*                                           | :heavy_minus_sign:                                 | N/A                                                |