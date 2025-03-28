# ResponseBody

## Example Usage

```typescript
import { ResponseBody } from "@clerk/backend-sdk/models/operations";

let value: ResponseBody = {};
```

## Fields

| Field                                                                              | Type                                                                               | Required                                                                           | Description                                                                        |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `object`                                                                           | *string*                                                                           | :heavy_minus_sign:                                                                 | N/A                                                                                |
| `externalAccountId`                                                                | *string*                                                                           | :heavy_minus_sign:                                                                 | External account ID                                                                |
| `providerUserId`                                                                   | *string*                                                                           | :heavy_minus_sign:                                                                 | The unique ID of the user in the external provider's system                        |
| `token`                                                                            | *string*                                                                           | :heavy_minus_sign:                                                                 | The access token                                                                   |
| `provider`                                                                         | *string*                                                                           | :heavy_minus_sign:                                                                 | The ID of the provider                                                             |
| `publicMetadata`                                                                   | Record<string, *any*>                                                              | :heavy_minus_sign:                                                                 | N/A                                                                                |
| `label`                                                                            | *string*                                                                           | :heavy_minus_sign:                                                                 | N/A                                                                                |
| `scopes`                                                                           | *string*[]                                                                         | :heavy_minus_sign:                                                                 | The list of scopes that the token is valid for.<br/>Only present for OAuth 2.0 tokens. |
| `tokenSecret`                                                                      | *string*                                                                           | :heavy_minus_sign:                                                                 | The token secret. Only present for OAuth 1.0 tokens.                               |
| `expiresAt`                                                                        | *number*                                                                           | :heavy_minus_sign:                                                                 | Unix timestamp of the access token expiration.                                     |