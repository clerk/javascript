# SessionActivityResponse

## Example Usage

```typescript
import { SessionActivityResponse } from '@clerk/backend-sdk/models/components';

let value: SessionActivityResponse = {
  object: '<value>',
  id: '<id>',
  isMobile: false,
};
```

## Fields

| Field            | Type      | Required           | Description |
| ---------------- | --------- | ------------------ | ----------- |
| `object`         | _string_  | :heavy_check_mark: | N/A         |
| `id`             | _string_  | :heavy_check_mark: | N/A         |
| `deviceType`     | _string_  | :heavy_minus_sign: | N/A         |
| `isMobile`       | _boolean_ | :heavy_check_mark: | N/A         |
| `browserName`    | _string_  | :heavy_minus_sign: | N/A         |
| `browserVersion` | _string_  | :heavy_minus_sign: | N/A         |
| `ipAddress`      | _string_  | :heavy_minus_sign: | N/A         |
| `city`           | _string_  | :heavy_minus_sign: | N/A         |
| `country`        | _string_  | :heavy_minus_sign: | N/A         |
