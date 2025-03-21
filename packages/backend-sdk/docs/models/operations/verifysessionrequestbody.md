# VerifySessionRequestBody

Parameters.

## Example Usage

```typescript
import { VerifySessionRequestBody } from '@clerk/backend-sdk/models/operations';

let value: VerifySessionRequestBody = {};
```

## Fields

| Field   | Type     | Required           | Description                                                                                                                             |
| ------- | -------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `token` | _string_ | :heavy_minus_sign: | The JWT that is sent via the `__session` cookie from your frontend.<br/>Note: this JWT must be associated with the supplied session ID. |
