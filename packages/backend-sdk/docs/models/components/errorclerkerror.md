# ErrorClerkError

## Example Usage

```typescript
import { ErrorClerkError } from "@clerk/backend-sdk/models/components";

let value: ErrorClerkError = {
  message: "<value>",
  longMessage: "<value>",
  code: "<value>",
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `message`                                                    | *string*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `longMessage`                                                | *string*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `code`                                                       | *string*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `meta`                                                       | [components.ErrorMeta](../../models/components/errormeta.md) | :heavy_minus_sign:                                           | N/A                                                          |
| `clerkTraceId`                                               | *string*                                                     | :heavy_minus_sign:                                           | N/A                                                          |