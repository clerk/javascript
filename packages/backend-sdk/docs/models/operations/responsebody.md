# ResponseBody

## Example Usage

```typescript
import { ResponseBody } from '@clerk/backend-sdk/models/operations';

let value: ResponseBody = {};
```

## Fields

| Field               | Type                  | Required           | Description                                                                            |
| ------------------- | --------------------- | ------------------ | -------------------------------------------------------------------------------------- |
| `object`            | _string_              | :heavy_minus_sign: | N/A                                                                                    |
| `externalAccountId` | _string_              | :heavy_minus_sign: | External account ID                                                                    |
| `providerUserId`    | _string_              | :heavy_minus_sign: | The unique ID of the user in the external provider's system                            |
| `token`             | _string_              | :heavy_minus_sign: | The access token                                                                       |
| `provider`          | _string_              | :heavy_minus_sign: | The ID of the provider                                                                 |
| `publicMetadata`    | Record<string, _any_> | :heavy_minus_sign: | N/A                                                                                    |
| `label`             | _string_              | :heavy_minus_sign: | N/A                                                                                    |
| `scopes`            | _string_[]            | :heavy_minus_sign: | The list of scopes that the token is valid for.<br/>Only present for OAuth 2.0 tokens. |
| `tokenSecret`       | _string_              | :heavy_minus_sign: | The token secret. Only present for OAuth 1.0 tokens.                                   |
| `expiresAt`         | _number_              | :heavy_minus_sign: | Unix timestamp of the access token expiration.                                         |
