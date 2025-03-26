# RefreshSessionRequestBody

Refresh session parameters

## Example Usage

```typescript
import { RefreshSessionRequestBody } from '@clerk/backend-sdk/models/operations';

let value: RefreshSessionRequestBody = {
  expiredToken: '<value>',
  refreshToken: '<value>',
  requestOrigin: '<value>',
};
```

## Fields

| Field                  | Type                                                   | Required           | Description                                                                                                                             |
| ---------------------- | ------------------------------------------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `expiredToken`         | _string_                                               | :heavy_check_mark: | The JWT that is sent via the `__session` cookie from your frontend.<br/>Note: this JWT must be associated with the supplied session ID. |
| `refreshToken`         | _string_                                               | :heavy_check_mark: | The JWT that is sent via the `__session` cookie from your frontend.                                                                     |
| `requestOrigin`        | _string_                                               | :heavy_check_mark: | The origin of the request.                                                                                                              |
| `requestHeaders`       | Record<string, _any_>                                  | :heavy_minus_sign: | The headers of the request.                                                                                                             |
| `format`               | [operations.Format](../../models/operations/format.md) | :heavy_minus_sign: | The format of the response.                                                                                                             |
| `requestOriginatingIp` | _string_                                               | :heavy_minus_sign: | The IP address of the request.                                                                                                          |
