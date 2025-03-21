# VerifySessionRequest

## Example Usage

```typescript
import { VerifySessionRequest } from '@clerk/backend-sdk/models/operations';

let value: VerifySessionRequest = {
  sessionId: '<id>',
};
```

## Fields

| Field         | Type                                                                                       | Required           | Description           |
| ------------- | ------------------------------------------------------------------------------------------ | ------------------ | --------------------- |
| `sessionId`   | _string_                                                                                   | :heavy_check_mark: | The ID of the session |
| `requestBody` | [operations.VerifySessionRequestBody](../../models/operations/verifysessionrequestbody.md) | :heavy_minus_sign: | Parameters.           |
