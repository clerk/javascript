# CreateOAuthApplicationRequestBody

## Example Usage

```typescript
import { CreateOAuthApplicationRequestBody } from '@clerk/backend-sdk/models/operations';

let value: CreateOAuthApplicationRequestBody = {
  name: '<value>',
};
```

## Fields

| Field             | Type       | Required           | Description                                                                                                                                                                                                                                                            | Example                       |
| ----------------- | ---------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `name`            | _string_   | :heavy_check_mark: | The name of the new OAuth application.<br/>Max length: 256                                                                                                                                                                                                             |                               |
| `redirectUris`    | _string_[] | :heavy_minus_sign: | An array of redirect URIs of the new OAuth application                                                                                                                                                                                                                 |                               |
| ~~`callbackUrl`~~ | _string_   | :heavy_minus_sign: | : warning: ** DEPRECATED **: This will be removed in a future release, please migrate away from it as soon as possible.<br/><br/>The callback URL of the new OAuth application                                                                                         |                               |
| `scopes`          | _string_   | :heavy_minus_sign: | Define the allowed scopes for the new OAuth applications that dictate the user payload of the OAuth user info endpoint. Available scopes are `profile`, `email`, `public_metadata`, `private_metadata`. Provide the requested scopes as a string, separated by spaces. | profile email public_metadata |
| `public`          | _boolean_  | :heavy_minus_sign: | If true, this client is public and you can use the Proof Key of Code Exchange (PKCE) flow.                                                                                                                                                                             |                               |
