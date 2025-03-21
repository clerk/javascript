# UpdateSAMLConnectionRequest

## Example Usage

```typescript
import { UpdateSAMLConnectionRequest } from '@clerk/backend-sdk/models/operations';

let value: UpdateSAMLConnectionRequest = {
  samlConnectionId: '<id>',
  requestBody: {},
};
```

## Fields

| Field              | Type                                                                                                     | Required           | Description                             |
| ------------------ | -------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------- |
| `samlConnectionId` | _string_                                                                                                 | :heavy_check_mark: | The ID of the SAML Connection to update |
| `requestBody`      | [operations.UpdateSAMLConnectionRequestBody](../../models/operations/updatesamlconnectionrequestbody.md) | :heavy_check_mark: | N/A                                     |
