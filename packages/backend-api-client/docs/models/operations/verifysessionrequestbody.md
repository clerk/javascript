# VerifySessionRequestBody

Parameters.

## Example Usage

```typescript
import { VerifySessionRequestBody } from "@clerk/backend-api-client/models/operations";

let value: VerifySessionRequestBody = {};
```

## Fields

| Field                                                                                                                               | Type                                                                                                                                | Required                                                                                                                            | Description                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `token`                                                                                                                             | *string*                                                                                                                            | :heavy_minus_sign:                                                                                                                  | The JWT that is sent via the `__session` cookie from your frontend.<br/>Note: this JWT must be associated with the supplied session ID. |