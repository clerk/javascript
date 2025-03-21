# SAMLConnectionSAMLConnection

## Example Usage

```typescript
import { SAMLConnectionSAMLConnection } from '@clerk/backend-sdk/models/components';

let value: SAMLConnectionSAMLConnection = {
  id: '<id>',
  name: '<value>',
  domain: 'minty-airman.biz',
  active: false,
  provider: '<value>',
  syncUserAttributes: false,
  createdAt: 424685,
  updatedAt: 374170,
};
```

## Fields

| Field                              | Type      | Required           | Description                         |
| ---------------------------------- | --------- | ------------------ | ----------------------------------- |
| `id`                               | _string_  | :heavy_check_mark: | N/A                                 |
| `name`                             | _string_  | :heavy_check_mark: | N/A                                 |
| `domain`                           | _string_  | :heavy_check_mark: | N/A                                 |
| `active`                           | _boolean_ | :heavy_check_mark: | N/A                                 |
| `provider`                         | _string_  | :heavy_check_mark: | N/A                                 |
| `syncUserAttributes`               | _boolean_ | :heavy_check_mark: | N/A                                 |
| `allowSubdomains`                  | _boolean_ | :heavy_minus_sign: | N/A                                 |
| `allowIdpInitiated`                | _boolean_ | :heavy_minus_sign: | N/A                                 |
| `disableAdditionalIdentifications` | _boolean_ | :heavy_minus_sign: | N/A                                 |
| `createdAt`                        | _number_  | :heavy_check_mark: | Unix timestamp of creation.<br/>    |
| `updatedAt`                        | _number_  | :heavy_check_mark: | Unix timestamp of last update.<br/> |
