# JWKSEcdsaPrivateKey

## Example Usage

```typescript
import { JWKSEcdsaPrivateKey } from '@clerk/backend-sdk/models/components';

let value: JWKSEcdsaPrivateKey = {
  kid: '<id>',
  alg: '<value>',
  use: '<value>',
  kty: 'EC',
  crv: '<value>',
  x: '<value>',
  y: '<value>',
  d: '<value>',
};
```

## Fields

| Field           | Type                                                                                   | Required           | Description |
| --------------- | -------------------------------------------------------------------------------------- | ------------------ | ----------- |
| `kid`           | _string_                                                                               | :heavy_check_mark: | N/A         |
| `alg`           | _string_                                                                               | :heavy_check_mark: | N/A         |
| `use`           | _string_                                                                               | :heavy_check_mark: | N/A         |
| `kty`           | [components.JWKSEcdsaPrivateKeyKty](../../models/components/jwksecdsaprivatekeykty.md) | :heavy_check_mark: | N/A         |
| `crv`           | _string_                                                                               | :heavy_check_mark: | N/A         |
| `x`             | _string_                                                                               | :heavy_check_mark: | N/A         |
| `y`             | _string_                                                                               | :heavy_check_mark: | N/A         |
| `d`             | _string_                                                                               | :heavy_check_mark: | N/A         |
| `x5c`           | _string_[]                                                                             | :heavy_minus_sign: | N/A         |
| `x5t`           | _string_                                                                               | :heavy_minus_sign: | N/A         |
| `x5tNumberS256` | _string_                                                                               | :heavy_minus_sign: | N/A         |
| `x5u`           | _string_                                                                               | :heavy_minus_sign: | N/A         |
