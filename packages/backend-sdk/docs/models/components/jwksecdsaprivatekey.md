# JWKSEcdsaPrivateKey

## Example Usage

```typescript
import { JWKSEcdsaPrivateKey } from "@clerk/backend-sdk/models/components";

let value: JWKSEcdsaPrivateKey = {
  kid: "<id>",
  alg: "<value>",
  use: "<value>",
  kty: "EC",
  crv: "<value>",
  x: "<value>",
  y: "<value>",
  d: "<value>",
};
```

## Fields

| Field                                                                                  | Type                                                                                   | Required                                                                               | Description                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `kid`                                                                                  | *string*                                                                               | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `alg`                                                                                  | *string*                                                                               | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `use`                                                                                  | *string*                                                                               | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `kty`                                                                                  | [components.JWKSEcdsaPrivateKeyKty](../../models/components/jwksecdsaprivatekeykty.md) | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `crv`                                                                                  | *string*                                                                               | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `x`                                                                                    | *string*                                                                               | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `y`                                                                                    | *string*                                                                               | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `d`                                                                                    | *string*                                                                               | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `x5c`                                                                                  | *string*[]                                                                             | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `x5t`                                                                                  | *string*                                                                               | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `x5tNumberS256`                                                                        | *string*                                                                               | :heavy_minus_sign:                                                                     | N/A                                                                                    |
| `x5u`                                                                                  | *string*                                                                               | :heavy_minus_sign:                                                                     | N/A                                                                                    |