# JWKSEcdsaPublicKey

## Example Usage

```typescript
import { JWKSEcdsaPublicKey } from '@clerk/backend-sdk/models/components';

let value: JWKSEcdsaPublicKey = {
  kid: '<id>',
  alg: '<value>',
  use: '<value>',
  kty: 'EC',
  crv: '<value>',
  x: '<value>',
  y: '<value>',
};
```

## Fields

| Field           | Type                                                                                 | Required           | Description |
| --------------- | ------------------------------------------------------------------------------------ | ------------------ | ----------- |
| `kid`           | _string_                                                                             | :heavy_check_mark: | N/A         |
| `alg`           | _string_                                                                             | :heavy_check_mark: | N/A         |
| `use`           | _string_                                                                             | :heavy_check_mark: | N/A         |
| `kty`           | [components.JWKSEcdsaPublicKeyKty](../../models/components/jwksecdsapublickeykty.md) | :heavy_check_mark: | N/A         |
| `crv`           | _string_                                                                             | :heavy_check_mark: | N/A         |
| `x`             | _string_                                                                             | :heavy_check_mark: | N/A         |
| `y`             | _string_                                                                             | :heavy_check_mark: | N/A         |
| `x5c`           | _string_[]                                                                           | :heavy_minus_sign: | N/A         |
| `x5t`           | _string_                                                                             | :heavy_minus_sign: | N/A         |
| `x5tNumberS256` | _string_                                                                             | :heavy_minus_sign: | N/A         |
| `x5u`           | _string_                                                                             | :heavy_minus_sign: | N/A         |
