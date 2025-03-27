# JWKSRsaPublicKey

## Example Usage

```typescript
import { JWKSRsaPublicKey } from "@clerk/backend-sdk/models/components";

let value: JWKSRsaPublicKey = {
  kid: "<id>",
  alg: "<value>",
  use: "<value>",
  kty: "RSA",
  n: "<value>",
  e: "<value>",
};
```

## Fields

| Field                                                                            | Type                                                                             | Required                                                                         | Description                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `kid`                                                                            | *string*                                                                         | :heavy_check_mark:                                                               | N/A                                                                              |
| `alg`                                                                            | *string*                                                                         | :heavy_check_mark:                                                               | N/A                                                                              |
| `use`                                                                            | *string*                                                                         | :heavy_check_mark:                                                               | N/A                                                                              |
| `kty`                                                                            | [components.JWKSRsaPublicKeyKty](../../models/components/jwksrsapublickeykty.md) | :heavy_check_mark:                                                               | N/A                                                                              |
| `n`                                                                              | *string*                                                                         | :heavy_check_mark:                                                               | N/A                                                                              |
| `e`                                                                              | *string*                                                                         | :heavy_check_mark:                                                               | N/A                                                                              |
| `x5c`                                                                            | *string*[]                                                                       | :heavy_minus_sign:                                                               | N/A                                                                              |
| `x5t`                                                                            | *string*                                                                         | :heavy_minus_sign:                                                               | N/A                                                                              |
| `x5tNumberS256`                                                                  | *string*                                                                         | :heavy_minus_sign:                                                               | N/A                                                                              |
| `x5u`                                                                            | *string*                                                                         | :heavy_minus_sign:                                                               | N/A                                                                              |