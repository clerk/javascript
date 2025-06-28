# JWKSEd25519PublicKey

## Example Usage

```typescript
import { JWKSEd25519PublicKey } from "@clerk/backend-api-client/models/components";

let value: JWKSEd25519PublicKey = {
  kid: "<id>",
  alg: "<value>",
  use: "<value>",
  kty: "OKP",
  crv: "Ed25519",
  x: "<value>",
};
```

## Fields

| Field                                            | Type                                             | Required                                         | Description                                      |
| ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ |
| `kid`                                            | *string*                                         | :heavy_check_mark:                               | N/A                                              |
| `alg`                                            | *string*                                         | :heavy_check_mark:                               | N/A                                              |
| `use`                                            | *string*                                         | :heavy_check_mark:                               | N/A                                              |
| `kty`                                            | [components.Kty](../../models/components/kty.md) | :heavy_check_mark:                               | N/A                                              |
| `crv`                                            | [components.Crv](../../models/components/crv.md) | :heavy_check_mark:                               | N/A                                              |
| `x`                                              | *string*                                         | :heavy_check_mark:                               | N/A                                              |
| `x5c`                                            | *string*[]                                       | :heavy_minus_sign:                               | N/A                                              |
| `x5t`                                            | *string*                                         | :heavy_minus_sign:                               | N/A                                              |
| `x5tNumberS256`                                  | *string*                                         | :heavy_minus_sign:                               | N/A                                              |
| `x5u`                                            | *string*                                         | :heavy_minus_sign:                               | N/A                                              |