# SAMLAccount

## Example Usage

```typescript
import { SAMLAccount } from '@clerk/backend-sdk/models/components';

let value: SAMLAccount = {
  id: '<id>',
  object: 'saml_account',
  provider: '<value>',
  active: false,
  emailAddress: 'Brendon_Hyatt18@yahoo.com',
  verification: {
    status: 'verified',
    strategy: 'saml',
    externalVerificationRedirectUrl: 'https://sniveling-republican.org',
    expireAt: 83422,
    attempts: 552193,
  },
};
```

## Fields

| Field            | Type                                                                         | Required           | Description                                                                                |
| ---------------- | ---------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| `id`             | _string_                                                                     | :heavy_check_mark: | N/A                                                                                        |
| `object`         | [components.SAMLAccountObject](../../models/components/samlaccountobject.md) | :heavy_check_mark: | String representing the object's type. Objects of the same type share the same value.<br/> |
| `provider`       | _string_                                                                     | :heavy_check_mark: | N/A                                                                                        |
| `active`         | _boolean_                                                                    | :heavy_check_mark: | N/A                                                                                        |
| `emailAddress`   | _string_                                                                     | :heavy_check_mark: | N/A                                                                                        |
| `firstName`      | _string_                                                                     | :heavy_minus_sign: | N/A                                                                                        |
| `lastName`       | _string_                                                                     | :heavy_minus_sign: | N/A                                                                                        |
| `providerUserId` | _string_                                                                     | :heavy_minus_sign: | N/A                                                                                        |
| `publicMetadata` | Record<string, _any_>                                                        | :heavy_minus_sign: | N/A                                                                                        |
| `verification`   | _components.SAMLAccountVerification_                                         | :heavy_check_mark: | N/A                                                                                        |
| `samlConnection` | _components.SamlConnection_                                                  | :heavy_minus_sign: | N/A                                                                                        |
