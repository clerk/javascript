# UpdateOAuthApplicationRequest

## Example Usage

```typescript
import { UpdateOAuthApplicationRequest } from '@clerk/backend-sdk/models/operations';

let value: UpdateOAuthApplicationRequest = {
  oauthApplicationId: '<id>',
  requestBody: {},
};
```

## Fields

| Field                | Type                                                                                                         | Required           | Description                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------ | ----------------------------------------- |
| `oauthApplicationId` | _string_                                                                                                     | :heavy_check_mark: | The ID of the OAuth application to update |
| `requestBody`        | [operations.UpdateOAuthApplicationRequestBody](../../models/operations/updateoauthapplicationrequestbody.md) | :heavy_check_mark: | N/A                                       |
