# SAMLErrorClerkError

## Example Usage

```typescript
import { SAMLErrorClerkError } from "@clerk/backend-sdk/models/components";

let value: SAMLErrorClerkError = {
  message: "<value>",
  longMessage: "<value>",
  code: "<value>",
};
```

## Fields

| Field                                                                            | Type                                                                             | Required                                                                         | Description                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `message`                                                                        | *string*                                                                         | :heavy_check_mark:                                                               | N/A                                                                              |
| `longMessage`                                                                    | *string*                                                                         | :heavy_check_mark:                                                               | N/A                                                                              |
| `code`                                                                           | *string*                                                                         | :heavy_check_mark:                                                               | N/A                                                                              |
| `meta`                                                                           | [components.ClerkErrorErrorMeta](../../models/components/clerkerrorerrormeta.md) | :heavy_minus_sign:                                                               | N/A                                                                              |
| `clerkTraceId`                                                                   | *string*                                                                         | :heavy_minus_sign:                                                               | N/A                                                                              |