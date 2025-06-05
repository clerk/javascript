# CreateSessionTokenRequest

## Example Usage

```typescript
import { CreateSessionTokenRequest } from "@clerk/backend-api-client/models/operations";

let value: CreateSessionTokenRequest = {
  sessionId: "<id>",
};
```

## Fields

| Field                                                                                                | Type                                                                                                 | Required                                                                                             | Description                                                                                          |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `sessionId`                                                                                          | *string*                                                                                             | :heavy_check_mark:                                                                                   | The ID of the session                                                                                |
| `requestBody`                                                                                        | [operations.CreateSessionTokenRequestBody](../../models/operations/createsessiontokenrequestbody.md) | :heavy_minus_sign:                                                                                   | N/A                                                                                                  |