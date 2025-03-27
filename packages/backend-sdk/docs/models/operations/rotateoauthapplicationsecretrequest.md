# RotateOAuthApplicationSecretRequest

## Example Usage

```typescript
import { RotateOAuthApplicationSecretRequest } from "@clerk/backend-sdk/models/operations";

let value: RotateOAuthApplicationSecretRequest = {
  oauthApplicationId: "<id>",
};
```

## Fields

| Field                                                                 | Type                                                                  | Required                                                              | Description                                                           |
| --------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `oauthApplicationId`                                                  | *string*                                                              | :heavy_check_mark:                                                    | The ID of the OAuth application for which to rotate the client secret |