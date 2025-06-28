# JWTTemplate

List of JWT templates

## Example Usage

```typescript
import { JWTTemplate } from "@clerk/backend-api-client/models/components";

let value: JWTTemplate = {
  object: "jwt_template",
  id: "<id>",
  name: "<value>",
  claims: {},
  lifetime: 358570,
  allowedClockSkew: 679793,
  customSigningKey: false,
  signingAlgorithm: "<value>",
  createdAt: 933621,
  updatedAt: 463729,
};
```

## Fields

| Field                                                                        | Type                                                                         | Required                                                                     | Description                                                                  |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `object`                                                                     | [components.JWTTemplateObject](../../models/components/jwttemplateobject.md) | :heavy_check_mark:                                                           | N/A                                                                          |
| `id`                                                                         | *string*                                                                     | :heavy_check_mark:                                                           | N/A                                                                          |
| `name`                                                                       | *string*                                                                     | :heavy_check_mark:                                                           | N/A                                                                          |
| `claims`                                                                     | [components.Claims](../../models/components/claims.md)                       | :heavy_check_mark:                                                           | N/A                                                                          |
| `lifetime`                                                                   | *number*                                                                     | :heavy_check_mark:                                                           | N/A                                                                          |
| `allowedClockSkew`                                                           | *number*                                                                     | :heavy_check_mark:                                                           | N/A                                                                          |
| `customSigningKey`                                                           | *boolean*                                                                    | :heavy_check_mark:                                                           | N/A                                                                          |
| `signingAlgorithm`                                                           | *string*                                                                     | :heavy_check_mark:                                                           | N/A                                                                          |
| `createdAt`                                                                  | *number*                                                                     | :heavy_check_mark:                                                           | Unix timestamp of creation.<br/>                                             |
| `updatedAt`                                                                  | *number*                                                                     | :heavy_check_mark:                                                           | Unix timestamp of last update.<br/>                                          |