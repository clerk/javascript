# UpdateEmailAddressRequestBody

## Example Usage

```typescript
import { UpdateEmailAddressRequestBody } from "@clerk/backend-sdk/models/operations";

let value: UpdateEmailAddressRequestBody = {};
```

## Fields

| Field                                                             | Type                                                              | Required                                                          | Description                                                       |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| `verified`                                                        | *boolean*                                                         | :heavy_minus_sign:                                                | The email address will be marked as verified.                     |
| `primary`                                                         | *boolean*                                                         | :heavy_minus_sign:                                                | Set this email address as the primary email address for the user. |