# RefreshSessionRequestBody

Refresh session parameters

## Example Usage

```typescript
import { RefreshSessionRequestBody } from "@clerk/backend-api-client/models/operations";

let value: RefreshSessionRequestBody = {
  expiredToken: "<value>",
  refreshToken: "<value>",
  requestOrigin: "<value>",
};
```

## Fields

| Field                                                                                                                               | Type                                                                                                                                | Required                                                                                                                            | Description                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `expiredToken`                                                                                                                      | *string*                                                                                                                            | :heavy_check_mark:                                                                                                                  | The JWT that is sent via the `__session` cookie from your frontend.<br/>Note: this JWT must be associated with the supplied session ID. |
| `refreshToken`                                                                                                                      | *string*                                                                                                                            | :heavy_check_mark:                                                                                                                  | The JWT that is sent via the `__session` cookie from your frontend.                                                                 |
| `requestOrigin`                                                                                                                     | *string*                                                                                                                            | :heavy_check_mark:                                                                                                                  | The origin of the request.                                                                                                          |
| `requestHeaders`                                                                                                                    | Record<string, *any*>                                                                                                               | :heavy_minus_sign:                                                                                                                  | The headers of the request.                                                                                                         |
| `format`                                                                                                                            | [operations.Format](../../models/operations/format.md)                                                                              | :heavy_minus_sign:                                                                                                                  | The format of the response.                                                                                                         |
| `requestOriginatingIp`                                                                                                              | *string*                                                                                                                            | :heavy_minus_sign:                                                                                                                  | The IP address of the request.                                                                                                      |