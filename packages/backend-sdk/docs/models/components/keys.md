# Keys


## Supported Types

### `components.JWKSEd25519PublicKey`

```typescript
const value: components.JWKSEd25519PublicKey = {
  kid: "<id>",
  alg: "<value>",
  use: "<value>",
  kty: "OKP",
  crv: "Ed25519",
  x: "<value>",
};
```

### `components.JWKSEcdsaPublicKey`

```typescript
const value: components.JWKSEcdsaPublicKey = {
  kid: "<id>",
  alg: "<value>",
  use: "<value>",
  kty: "EC",
  crv: "<value>",
  x: "<value>",
  y: "<value>",
};
```

### `components.JWKSRsaPublicKey`

```typescript
const value: components.JWKSRsaPublicKey = {
  kid: "<id>",
  alg: "<value>",
  use: "<value>",
  kty: "RSA",
  n: "<value>",
  e: "<value>",
};
```

### `components.JWKSEd25519PrivateKey`

```typescript
const value: components.JWKSEd25519PrivateKey = {
  kid: "<id>",
  alg: "<value>",
  use: "<value>",
  kty: "OKP",
  crv: "Ed25519",
  x: "<value>",
  d: "<value>",
};
```

### `components.JWKSEcdsaPrivateKey`

```typescript
const value: components.JWKSEcdsaPrivateKey = {
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

### `components.JWKSRsaPrivateKey`

```typescript
const value: components.JWKSRsaPrivateKey = {
  kid: "<id>",
  alg: "<value>",
  use: "<value>",
  kty: "RSA",
  n: "<value>",
  e: "<value>",
  d: "<value>",
  p: "<value>",
  q: "<value>",
};
```

### `components.JWKSSymmetricKey`

```typescript
const value: components.JWKSSymmetricKey = {
  kid: "<id>",
  alg: "<value>",
  use: "<value>",
  kty: "oct",
  k: "<value>",
};
```

