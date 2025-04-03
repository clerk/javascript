# JWKSEd25519PrivateKey

## Example Usage

```typescript
import { JWKSEd25519PrivateKey } from "@clerk/backend-api-client/models/components";

let value: JWKSEd25519PrivateKey = {
  kid: "<id>",
  alg: "<value>",
  use: "<value>",
  kty: "OKP",
  crv: "Ed25519",
  x: "<value>",
  d: "<value>",
};
```

## Fields

| Field                                                                                      | Type                                                                                       | Required                                                                                   | Description                                                                                |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `kid`                                                                                      | *string*                                                                                   | :heavy_check_mark:                                                                         | N/A                                                                                        |
| `alg`                                                                                      | *string*                                                                                   | :heavy_check_mark:                                                                         | N/A                                                                                        |
| `use`                                                                                      | *string*                                                                                   | :heavy_check_mark:                                                                         | N/A                                                                                        |
| `kty`                                                                                      | [components.JWKSEd25519PrivateKeyKty](../../models/components/jwksed25519privatekeykty.md) | :heavy_check_mark:                                                                         | N/A                                                                                        |
| `crv`                                                                                      | [components.JWKSEd25519PrivateKeyCrv](../../models/components/jwksed25519privatekeycrv.md) | :heavy_check_mark:                                                                         | N/A                                                                                        |
| `x`                                                                                        | *string*                                                                                   | :heavy_check_mark:                                                                         | N/A                                                                                        |
| `d`                                                                                        | *string*                                                                                   | :heavy_check_mark:                                                                         | N/A                                                                                        |
| `x5c`                                                                                      | *string*[]                                                                                 | :heavy_minus_sign:                                                                         | N/A                                                                                        |
| `x5t`                                                                                      | *string*                                                                                   | :heavy_minus_sign:                                                                         | N/A                                                                                        |
| `x5tNumberS256`                                                                            | *string*                                                                                   | :heavy_minus_sign:                                                                         | N/A                                                                                        |
| `x5u`                                                                                      | *string*                                                                                   | :heavy_minus_sign:                                                                         | N/A                                                                                        |