# JWKSRsaPrivateKey

## Example Usage

```typescript
import { JWKSRsaPrivateKey } from "@clerk/backend-sdk/models/components";

let value: JWKSRsaPrivateKey = {
  kid: "<id>",
  alg: "<value>",
  use: "<value>",
  kty: "RSA",
  n: "<value>",
  e: "<value>",
  d: "<value>",
  p: "<value>",
  q: "<value>",
};
```

## Fields

| Field                                                                              | Type                                                                               | Required                                                                           | Description                                                                        |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `kid`                                                                              | *string*                                                                           | :heavy_check_mark:                                                                 | N/A                                                                                |
| `alg`                                                                              | *string*                                                                           | :heavy_check_mark:                                                                 | N/A                                                                                |
| `use`                                                                              | *string*                                                                           | :heavy_check_mark:                                                                 | N/A                                                                                |
| `kty`                                                                              | [components.JWKSRsaPrivateKeyKty](../../models/components/jwksrsaprivatekeykty.md) | :heavy_check_mark:                                                                 | N/A                                                                                |
| `n`                                                                                | *string*                                                                           | :heavy_check_mark:                                                                 | N/A                                                                                |
| `e`                                                                                | *string*                                                                           | :heavy_check_mark:                                                                 | N/A                                                                                |
| `d`                                                                                | *string*                                                                           | :heavy_check_mark:                                                                 | N/A                                                                                |
| `p`                                                                                | *string*                                                                           | :heavy_check_mark:                                                                 | N/A                                                                                |
| `q`                                                                                | *string*                                                                           | :heavy_check_mark:                                                                 | N/A                                                                                |
| `dp`                                                                               | *string*                                                                           | :heavy_minus_sign:                                                                 | N/A                                                                                |
| `dq`                                                                               | *string*                                                                           | :heavy_minus_sign:                                                                 | N/A                                                                                |
| `qi`                                                                               | *string*                                                                           | :heavy_minus_sign:                                                                 | N/A                                                                                |
| `x5c`                                                                              | *string*[]                                                                         | :heavy_minus_sign:                                                                 | N/A                                                                                |
| `x5t`                                                                              | *string*                                                                           | :heavy_minus_sign:                                                                 | N/A                                                                                |
| `x5tNumberS256`                                                                    | *string*                                                                           | :heavy_minus_sign:                                                                 | N/A                                                                                |
| `x5u`                                                                              | *string*                                                                           | :heavy_minus_sign:                                                                 | N/A                                                                                |