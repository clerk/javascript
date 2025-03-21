# JWKSEd25519PrivateKey

## Example Usage

```typescript
import { JWKSEd25519PrivateKey } from '@clerk/backend-sdk/models/components';

let value: JWKSEd25519PrivateKey = {
  kid: '<id>',
  alg: '<value>',
  use: '<value>',
  kty: 'OKP',
  crv: 'Ed25519',
  x: '<value>',
  d: '<value>',
};
```

## Fields

| Field           | Type                                                                                       | Required           | Description |
| --------------- | ------------------------------------------------------------------------------------------ | ------------------ | ----------- |
| `kid`           | _string_                                                                                   | :heavy_check_mark: | N/A         |
| `alg`           | _string_                                                                                   | :heavy_check_mark: | N/A         |
| `use`           | _string_                                                                                   | :heavy_check_mark: | N/A         |
| `kty`           | [components.JWKSEd25519PrivateKeyKty](../../models/components/jwksed25519privatekeykty.md) | :heavy_check_mark: | N/A         |
| `crv`           | [components.JWKSEd25519PrivateKeyCrv](../../models/components/jwksed25519privatekeycrv.md) | :heavy_check_mark: | N/A         |
| `x`             | _string_                                                                                   | :heavy_check_mark: | N/A         |
| `d`             | _string_                                                                                   | :heavy_check_mark: | N/A         |
| `x5c`           | _string_[]                                                                                 | :heavy_minus_sign: | N/A         |
| `x5t`           | _string_                                                                                   | :heavy_minus_sign: | N/A         |
| `x5tNumberS256` | _string_                                                                                   | :heavy_minus_sign: | N/A         |
| `x5u`           | _string_                                                                                   | :heavy_minus_sign: | N/A         |
