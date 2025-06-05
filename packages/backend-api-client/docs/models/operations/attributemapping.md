# AttributeMapping

Define the attribute name mapping between Identity Provider and Clerk's user properties

## Example Usage

```typescript
import { AttributeMapping } from "@clerk/backend-api-client/models/operations";

let value: AttributeMapping = {};
```

## Fields

| Field              | Type               | Required           | Description        |
| ------------------ | ------------------ | ------------------ | ------------------ |
| `userId`           | *string*           | :heavy_minus_sign: | N/A                |
| `emailAddress`     | *string*           | :heavy_minus_sign: | N/A                |
| `firstName`        | *string*           | :heavy_minus_sign: | N/A                |
| `lastName`         | *string*           | :heavy_minus_sign: | N/A                |