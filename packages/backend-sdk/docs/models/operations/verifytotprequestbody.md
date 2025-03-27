# VerifyTOTPRequestBody

## Example Usage

```typescript
import { VerifyTOTPRequestBody } from "@clerk/backend-sdk/models/operations";

let value: VerifyTOTPRequestBody = {
  code: "<value>",
};
```

## Fields

| Field                             | Type                              | Required                          | Description                       |
| --------------------------------- | --------------------------------- | --------------------------------- | --------------------------------- |
| `code`                            | *string*                          | :heavy_check_mark:                | The TOTP or backup code to verify |