# RefreshSessionRequest

## Example Usage

```typescript
import { RefreshSessionRequest } from '@clerk/backend-sdk/models/operations';

let value: RefreshSessionRequest = {
  sessionId: '<id>',
};
```

## Fields

| Field         | Type                                                                                         | Required           | Description                |
| ------------- | -------------------------------------------------------------------------------------------- | ------------------ | -------------------------- |
| `sessionId`   | _string_                                                                                     | :heavy_check_mark: | The ID of the session      |
| `requestBody` | [operations.RefreshSessionRequestBody](../../models/operations/refreshsessionrequestbody.md) | :heavy_minus_sign: | Refresh session parameters |
