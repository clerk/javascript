# UpdateSAMLConnectionAttributeMapping

Define the atrtibute name mapping between Identity Provider and Clerk's user properties

## Example Usage

```typescript
import { UpdateSAMLConnectionAttributeMapping } from "@clerk/backend-sdk/models/operations";

let value: UpdateSAMLConnectionAttributeMapping = {};
```

## Fields

| Field              | Type               | Required           | Description        |
| ------------------ | ------------------ | ------------------ | ------------------ |
| `userId`           | *string*           | :heavy_minus_sign: | N/A                |
| `emailAddress`     | *string*           | :heavy_minus_sign: | N/A                |
| `firstName`        | *string*           | :heavy_minus_sign: | N/A                |
| `lastName`         | *string*           | :heavy_minus_sign: | N/A                |