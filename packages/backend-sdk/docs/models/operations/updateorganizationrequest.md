# UpdateOrganizationRequest

## Example Usage

```typescript
import { UpdateOrganizationRequest } from '@clerk/backend-sdk/models/operations';

let value: UpdateOrganizationRequest = {
  organizationId: '<id>',
  requestBody: {},
};
```

## Fields

| Field            | Type                                                                                                 | Required           | Description                          |
| ---------------- | ---------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------ |
| `organizationId` | _string_                                                                                             | :heavy_check_mark: | The ID of the organization to update |
| `requestBody`    | [operations.UpdateOrganizationRequestBody](../../models/operations/updateorganizationrequestbody.md) | :heavy_check_mark: | N/A                                  |
