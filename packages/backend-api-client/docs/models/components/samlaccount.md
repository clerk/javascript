# SAMLAccount

## Example Usage

```typescript
import { SAMLAccount } from "@clerk/backend-api-client/models/components";

let value: SAMLAccount = {
  id: "<id>",
  object: "saml_account",
  provider: "<value>",
  active: false,
  emailAddress: "Brendon_Hyatt18@yahoo.com",
  verification: {
    status: "verified",
    strategy: "saml",
    externalVerificationRedirectUrl: "https://sniveling-republican.org",
    expireAt: 83422,
    attempts: 552193,
  },
};
```

## Fields

| Field                                                                                  | Type                                                                                   | Required                                                                               | Description                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `id`                                                                                   | *string*                                                                               | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `object`                                                                               | [components.SAMLAccountObject](../../models/components/samlaccountobject.md)           | :heavy_check_mark:                                                                     | String representing the object's type. Objects of the same type share the same value.<br/> |
| `provider`                                                                             | *string*                                                                               | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `active`                                                                               | *boolean*                                                                              | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `emailAddress`                                                                         | *string*                                                                               | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `firstName`                                                                            | *string*                                                                               | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `lastName`                                                                             | *string*                                                                               | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `providerUserId`                                                                       | *string*                                                                               | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `publicMetadata`                                                                       | Record<string, *any*>                                                                  | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `verification`                                                                         | *components.SAMLAccountVerification*                                                   | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `samlConnection`                                                                       | *components.SamlConnection*                                                            | :heavy_minus_sign:                                                                     | N/A                                                                                    |