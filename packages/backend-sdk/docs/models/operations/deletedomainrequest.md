# DeleteDomainRequest

## Example Usage

```typescript
import { DeleteDomainRequest } from '@clerk/backend-sdk/models/operations';

let value: DeleteDomainRequest = {
  domainId: '<id>',
};
```

## Fields

| Field      | Type     | Required           | Description                                                            |
| ---------- | -------- | ------------------ | ---------------------------------------------------------------------- |
| `domainId` | _string_ | :heavy_check_mark: | The ID of the domain that will be deleted. Must be a satellite domain. |
