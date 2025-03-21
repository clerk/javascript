# JWKSSymmetricKey

## Example Usage

```typescript
import { JWKSSymmetricKey } from '@clerk/backend-sdk/models/components';

let value: JWKSSymmetricKey = {
  kid: '<id>',
  alg: '<value>',
  use: '<value>',
  kty: 'oct',
  k: '<value>',
};
```

## Fields

| Field           | Type                                                                             | Required           | Description |
| --------------- | -------------------------------------------------------------------------------- | ------------------ | ----------- |
| `kid`           | _string_                                                                         | :heavy_check_mark: | N/A         |
| `alg`           | _string_                                                                         | :heavy_check_mark: | N/A         |
| `use`           | _string_                                                                         | :heavy_check_mark: | N/A         |
| `kty`           | [components.JWKSSymmetricKeyKty](../../models/components/jwkssymmetrickeykty.md) | :heavy_check_mark: | N/A         |
| `k`             | _string_                                                                         | :heavy_check_mark: | N/A         |
| `x5c`           | _string_[]                                                                       | :heavy_minus_sign: | N/A         |
| `x5t`           | _string_                                                                         | :heavy_minus_sign: | N/A         |
| `x5tNumberS256` | _string_                                                                         | :heavy_minus_sign: | N/A         |
| `x5u`           | _string_                                                                         | :heavy_minus_sign: | N/A         |
