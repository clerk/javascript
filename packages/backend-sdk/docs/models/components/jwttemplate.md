# JWTTemplate

List of JWT templates

## Example Usage

```typescript
import { JWTTemplate } from '@clerk/backend-sdk/models/components';

let value: JWTTemplate = {
  object: 'jwt_template',
  id: '<id>',
  name: '<value>',
  claims: {},
  lifetime: 253191,
  allowedClockSkew: 131055,
  customSigningKey: false,
  signingAlgorithm: '<value>',
  createdAt: 12036,
  updatedAt: 115484,
};
```

## Fields

| Field              | Type                                                                         | Required           | Description                         |
| ------------------ | ---------------------------------------------------------------------------- | ------------------ | ----------------------------------- |
| `object`           | [components.JWTTemplateObject](../../models/components/jwttemplateobject.md) | :heavy_check_mark: | N/A                                 |
| `id`               | _string_                                                                     | :heavy_check_mark: | N/A                                 |
| `name`             | _string_                                                                     | :heavy_check_mark: | N/A                                 |
| `claims`           | [components.Claims](../../models/components/claims.md)                       | :heavy_check_mark: | N/A                                 |
| `lifetime`         | _number_                                                                     | :heavy_check_mark: | N/A                                 |
| `allowedClockSkew` | _number_                                                                     | :heavy_check_mark: | N/A                                 |
| `customSigningKey` | _boolean_                                                                    | :heavy_check_mark: | N/A                                 |
| `signingAlgorithm` | _string_                                                                     | :heavy_check_mark: | N/A                                 |
| `createdAt`        | _number_                                                                     | :heavy_check_mark: | Unix timestamp of creation.<br/>    |
| `updatedAt`        | _number_                                                                     | :heavy_check_mark: | Unix timestamp of last update.<br/> |
