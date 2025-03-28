# DeletedObject

Deleted Object

## Example Usage

```typescript
import { DeletedObject } from "@clerk/backend-sdk/models/components";

let value: DeletedObject = {
  object: "<value>",
  deleted: false,
};
```

## Fields

| Field              | Type               | Required           | Description        |
| ------------------ | ------------------ | ------------------ | ------------------ |
| `object`           | *string*           | :heavy_check_mark: | N/A                |
| `id`               | *string*           | :heavy_minus_sign: | N/A                |
| `slug`             | *string*           | :heavy_minus_sign: | N/A                |
| `deleted`          | *boolean*          | :heavy_check_mark: | N/A                |