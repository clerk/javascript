# VerifyClientRequestBody

Parameters.

## Example Usage

```typescript
import { VerifyClientRequestBody } from "@clerk/backend-api-client/models/operations";

let value: VerifyClientRequestBody = {
  token: "<value>",
};
```

## Fields

| Field                                    | Type                                     | Required                                 | Description                              |
| ---------------------------------------- | ---------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| `token`                                  | *string*                                 | :heavy_check_mark:                       | A JWT that represents the active client. |