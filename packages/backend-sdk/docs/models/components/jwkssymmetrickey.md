# JWKSSymmetricKey

## Example Usage

```typescript
import { JWKSSymmetricKey } from "@clerk/backend-sdk/models/components";

let value: JWKSSymmetricKey = {
  kid: "<id>",
  alg: "<value>",
  use: "<value>",
  kty: "oct",
  k: "<value>",
};
```

## Fields

| Field                                                                            | Type                                                                             | Required                                                                         | Description                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `kid`                                                                            | *string*                                                                         | :heavy_check_mark:                                                               | N/A                                                                              |
| `alg`                                                                            | *string*                                                                         | :heavy_check_mark:                                                               | N/A                                                                              |
| `use`                                                                            | *string*                                                                         | :heavy_check_mark:                                                               | N/A                                                                              |
| `kty`                                                                            | [components.JWKSSymmetricKeyKty](../../models/components/jwkssymmetrickeykty.md) | :heavy_check_mark:                                                               | N/A                                                                              |
| `k`                                                                              | *string*                                                                         | :heavy_check_mark:                                                               | N/A                                                                              |
| `x5c`                                                                            | *string*[]                                                                       | :heavy_minus_sign:                                                               | N/A                                                                              |
| `x5t`                                                                            | *string*                                                                         | :heavy_minus_sign:                                                               | N/A                                                                              |
| `x5tNumberS256`                                                                  | *string*                                                                         | :heavy_minus_sign:                                                               | N/A                                                                              |
| `x5u`                                                                            | *string*                                                                         | :heavy_minus_sign:                                                               | N/A                                                                              |