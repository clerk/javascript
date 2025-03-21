# UpdateUserRequest

## Example Usage

```typescript
import { UpdateUserRequest } from '@clerk/backend-sdk/models/operations';

let value: UpdateUserRequest = {
  userId: '<id>',
  requestBody: {},
};
```

## Fields

| Field         | Type                                                                                 | Required           | Description                  |
| ------------- | ------------------------------------------------------------------------------------ | ------------------ | ---------------------------- |
| `userId`      | _string_                                                                             | :heavy_check_mark: | The ID of the user to update |
| `requestBody` | [operations.UpdateUserRequestBody](../../models/operations/updateuserrequestbody.md) | :heavy_check_mark: | N/A                          |
