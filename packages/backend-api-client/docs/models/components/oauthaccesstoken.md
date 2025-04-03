# OAuthAccessToken

Success

## Example Usage

```typescript
import { OAuthAccessToken } from "@clerk/backend-api-client/models/components";

let value: OAuthAccessToken = {
  object: "oauth_access_token",
  externalAccountId: "<id>",
  providerUserId: "<id>",
  token: "<value>",
  expiresAt: 420539,
  provider: "<value>",
  publicMetadata: {
    "key": "<value>",
  },
  label: "<value>",
};
```

## Fields

| Field                                                                                  | Type                                                                                   | Required                                                                               | Description                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `object`                                                                               | [components.OAuthAccessTokenObject](../../models/components/oauthaccesstokenobject.md) | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `externalAccountId`                                                                    | *string*                                                                               | :heavy_check_mark:                                                                     | External account ID                                                                    |
| `providerUserId`                                                                       | *string*                                                                               | :heavy_check_mark:                                                                     | The unique ID of the user in the external provider's system                            |
| `token`                                                                                | *string*                                                                               | :heavy_check_mark:                                                                     | The access token                                                                       |
| `expiresAt`                                                                            | *number*                                                                               | :heavy_check_mark:                                                                     | Unix timestamp of the access token expiration.                                         |
| `provider`                                                                             | *string*                                                                               | :heavy_check_mark:                                                                     | The ID of the provider                                                                 |
| `publicMetadata`                                                                       | Record<string, *any*>                                                                  | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `label`                                                                                | *string*                                                                               | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `scopes`                                                                               | *string*[]                                                                             | :heavy_minus_sign:                                                                     | The list of scopes that the token is valid for. Only present for OAuth 2.0 tokens.     |
| `tokenSecret`                                                                          | *string*                                                                               | :heavy_minus_sign:                                                                     | The token secret. Only present for OAuth 1.0 tokens.                                   |