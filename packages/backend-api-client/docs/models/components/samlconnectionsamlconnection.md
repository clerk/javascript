# SAMLConnectionSAMLConnection

## Example Usage

```typescript
import { SAMLConnectionSAMLConnection } from "@clerk/backend-api-client/models/components";

let value: SAMLConnectionSAMLConnection = {
  id: "<id>",
  name: "<value>",
  domain: "minty-airman.biz",
  active: false,
  provider: "<value>",
  syncUserAttributes: false,
  createdAt: 424685,
  updatedAt: 374170,
};
```

## Fields

| Field                              | Type                               | Required                           | Description                        |
| ---------------------------------- | ---------------------------------- | ---------------------------------- | ---------------------------------- |
| `id`                               | *string*                           | :heavy_check_mark:                 | N/A                                |
| `name`                             | *string*                           | :heavy_check_mark:                 | N/A                                |
| `domain`                           | *string*                           | :heavy_check_mark:                 | N/A                                |
| `active`                           | *boolean*                          | :heavy_check_mark:                 | N/A                                |
| `provider`                         | *string*                           | :heavy_check_mark:                 | N/A                                |
| `syncUserAttributes`               | *boolean*                          | :heavy_check_mark:                 | N/A                                |
| `allowSubdomains`                  | *boolean*                          | :heavy_minus_sign:                 | N/A                                |
| `allowIdpInitiated`                | *boolean*                          | :heavy_minus_sign:                 | N/A                                |
| `disableAdditionalIdentifications` | *boolean*                          | :heavy_minus_sign:                 | N/A                                |
| `createdAt`                        | *number*                           | :heavy_check_mark:                 | Unix timestamp of creation.<br/>   |
| `updatedAt`                        | *number*                           | :heavy_check_mark:                 | Unix timestamp of last update.<br/> |