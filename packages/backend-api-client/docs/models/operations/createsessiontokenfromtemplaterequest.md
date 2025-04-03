# CreateSessionTokenFromTemplateRequest

## Example Usage

```typescript
import { CreateSessionTokenFromTemplateRequest } from "@clerk/backend-api-client/models/operations";

let value: CreateSessionTokenFromTemplateRequest = {
  sessionId: "<id>",
  templateName: "<value>",
};
```

## Fields

| Field                                                                                                                        | Type                                                                                                                         | Required                                                                                                                     | Description                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `sessionId`                                                                                                                  | *string*                                                                                                                     | :heavy_check_mark:                                                                                                           | The ID of the session                                                                                                        |
| `templateName`                                                                                                               | *string*                                                                                                                     | :heavy_check_mark:                                                                                                           | The name of the JWT Template defined in your instance (e.g. `custom_hasura`).                                                |
| `requestBody`                                                                                                                | [operations.CreateSessionTokenFromTemplateRequestBody](../../models/operations/createsessiontokenfromtemplaterequestbody.md) | :heavy_minus_sign:                                                                                                           | N/A                                                                                                                          |