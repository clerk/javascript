# JWKSRsaPublicKey

## Example Usage

```typescript
import { JWKSRsaPublicKey } from '@clerk/backend-sdk/models/components';

let value: JWKSRsaPublicKey = {
  kid: '<id>',
  alg: '<value>',
  use: '<value>',
  kty: 'RSA',
  n: '<value>',
  e: '<value>',
};
```

## Fields

| Field           | Type                                                                             | Required           | Description |
| --------------- | -------------------------------------------------------------------------------- | ------------------ | ----------- |
| `kid`           | _string_                                                                         | :heavy_check_mark: | N/A         |
| `alg`           | _string_                                                                         | :heavy_check_mark: | N/A         |
| `use`           | _string_                                                                         | :heavy_check_mark: | N/A         |
| `kty`           | [components.JWKSRsaPublicKeyKty](../../models/components/jwksrsapublickeykty.md) | :heavy_check_mark: | N/A         |
| `n`             | _string_                                                                         | :heavy_check_mark: | N/A         |
| `e`             | _string_                                                                         | :heavy_check_mark: | N/A         |
| `x5c`           | _string_[]                                                                       | :heavy_minus_sign: | N/A         |
| `x5t`           | _string_                                                                         | :heavy_minus_sign: | N/A         |
| `x5tNumberS256` | _string_                                                                         | :heavy_minus_sign: | N/A         |
| `x5u`           | _string_                                                                         | :heavy_minus_sign: | N/A         |
