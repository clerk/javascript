# Instance

Success

## Example Usage

```typescript
import { Instance } from '@clerk/backend-sdk/models/components';

let value: Instance = {
  object: 'instance',
  id: '<id>',
  environmentType: 'development',
  allowedOrigins: ['http://localhost:3000', 'https://some-domain'],
};
```

## Fields

| Field             | Type                                                                   | Required           | Description                                                                           | Example                                                        |
| ----------------- | ---------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `object`          | [components.InstanceObject](../../models/components/instanceobject.md) | :heavy_check_mark: | String representing the object's type. Objects of the same type share the same value. |                                                                |
| `id`              | _string_                                                               | :heavy_check_mark: | N/A                                                                                   |                                                                |
| `environmentType` | _string_                                                               | :heavy_check_mark: | N/A                                                                                   | development                                                    |
| `allowedOrigins`  | _string_[]                                                             | :heavy_check_mark: | N/A                                                                                   | [<br/>"http://localhost:3000",<br/>"https://some-domain"<br/>] |
