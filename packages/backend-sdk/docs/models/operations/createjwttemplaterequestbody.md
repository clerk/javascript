# CreateJWTTemplateRequestBody

## Example Usage

```typescript
import { CreateJWTTemplateRequestBody } from '@clerk/backend-sdk/models/operations';

let value: CreateJWTTemplateRequestBody = {
  name: '<value>',
  claims: {},
};
```

## Fields

| Field              | Type                                                   | Required           | Description                                                                                          |
| ------------------ | ------------------------------------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `name`             | _string_                                               | :heavy_check_mark: | JWT template name                                                                                    |
| `claims`           | [operations.Claims](../../models/operations/claims.md) | :heavy_check_mark: | JWT template claims in JSON format                                                                   |
| `lifetime`         | _number_                                               | :heavy_minus_sign: | JWT token lifetime                                                                                   |
| `allowedClockSkew` | _number_                                               | :heavy_minus_sign: | JWT token allowed clock skew                                                                         |
| `customSigningKey` | _boolean_                                              | :heavy_minus_sign: | Whether a custom signing key/algorithm is also provided for this template                            |
| `signingAlgorithm` | _string_                                               | :heavy_minus_sign: | The custom signing algorithm to use when minting JWTs. Required if `custom_signing_key` is `true`.   |
| `signingKey`       | _string_                                               | :heavy_minus_sign: | The custom signing private key to use when minting JWTs. Required if `custom_signing_key` is `true`. |
