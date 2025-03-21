# JWKSRsaPrivateKey

## Example Usage

```typescript
import { JWKSRsaPrivateKey } from '@clerk/backend-sdk/models/components';

let value: JWKSRsaPrivateKey = {
  kid: '<id>',
  alg: '<value>',
  use: '<value>',
  kty: 'RSA',
  n: '<value>',
  e: '<value>',
  d: '<value>',
  p: '<value>',
  q: '<value>',
};
```

## Fields

| Field           | Type                                                                               | Required           | Description |
| --------------- | ---------------------------------------------------------------------------------- | ------------------ | ----------- |
| `kid`           | _string_                                                                           | :heavy_check_mark: | N/A         |
| `alg`           | _string_                                                                           | :heavy_check_mark: | N/A         |
| `use`           | _string_                                                                           | :heavy_check_mark: | N/A         |
| `kty`           | [components.JWKSRsaPrivateKeyKty](../../models/components/jwksrsaprivatekeykty.md) | :heavy_check_mark: | N/A         |
| `n`             | _string_                                                                           | :heavy_check_mark: | N/A         |
| `e`             | _string_                                                                           | :heavy_check_mark: | N/A         |
| `d`             | _string_                                                                           | :heavy_check_mark: | N/A         |
| `p`             | _string_                                                                           | :heavy_check_mark: | N/A         |
| `q`             | _string_                                                                           | :heavy_check_mark: | N/A         |
| `dp`            | _string_                                                                           | :heavy_minus_sign: | N/A         |
| `dq`            | _string_                                                                           | :heavy_minus_sign: | N/A         |
| `qi`            | _string_                                                                           | :heavy_minus_sign: | N/A         |
| `x5c`           | _string_[]                                                                         | :heavy_minus_sign: | N/A         |
| `x5t`           | _string_                                                                           | :heavy_minus_sign: | N/A         |
| `x5tNumberS256` | _string_                                                                           | :heavy_minus_sign: | N/A         |
| `x5u`           | _string_                                                                           | :heavy_minus_sign: | N/A         |
