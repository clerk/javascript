# UpdateSAMLConnectionAttributeMapping

Define the atrtibute name mapping between Identity Provider and Clerk's user properties

## Example Usage

```typescript
import { UpdateSAMLConnectionAttributeMapping } from '@clerk/backend-sdk/models/operations';

let value: UpdateSAMLConnectionAttributeMapping = {};
```

## Fields

| Field          | Type     | Required           | Description |
| -------------- | -------- | ------------------ | ----------- |
| `userId`       | _string_ | :heavy_minus_sign: | N/A         |
| `emailAddress` | _string_ | :heavy_minus_sign: | N/A         |
| `firstName`    | _string_ | :heavy_minus_sign: | N/A         |
| `lastName`     | _string_ | :heavy_minus_sign: | N/A         |
