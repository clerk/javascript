# DeleteOAuthApplicationRequest

## Example Usage

```typescript
import { DeleteOAuthApplicationRequest } from "@clerk/backend-sdk/models/operations";

let value: DeleteOAuthApplicationRequest = {
  oauthApplicationId: "<id>",
};
```

## Fields

| Field                                     | Type                                      | Required                                  | Description                               |
| ----------------------------------------- | ----------------------------------------- | ----------------------------------------- | ----------------------------------------- |
| `oauthApplicationId`                      | *string*                                  | :heavy_check_mark:                        | The ID of the OAuth application to delete |