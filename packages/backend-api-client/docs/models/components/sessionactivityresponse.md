# SessionActivityResponse

## Example Usage

```typescript
import { SessionActivityResponse } from "@clerk/backend-api-client/models/components";

let value: SessionActivityResponse = {
  object: "<value>",
  id: "<id>",
  isMobile: false,
};
```

## Fields

| Field              | Type               | Required           | Description        |
| ------------------ | ------------------ | ------------------ | ------------------ |
| `object`           | *string*           | :heavy_check_mark: | N/A                |
| `id`               | *string*           | :heavy_check_mark: | N/A                |
| `deviceType`       | *string*           | :heavy_minus_sign: | N/A                |
| `isMobile`         | *boolean*          | :heavy_check_mark: | N/A                |
| `browserName`      | *string*           | :heavy_minus_sign: | N/A                |
| `browserVersion`   | *string*           | :heavy_minus_sign: | N/A                |
| `ipAddress`        | *string*           | :heavy_minus_sign: | N/A                |
| `city`             | *string*           | :heavy_minus_sign: | N/A                |
| `country`          | *string*           | :heavy_minus_sign: | N/A                |