# DeleteDomainRequest

## Example Usage

```typescript
import { DeleteDomainRequest } from "@clerk/backend-api-client/models/operations";

let value: DeleteDomainRequest = {
  domainId: "<id>",
};
```

## Fields

| Field                                                                  | Type                                                                   | Required                                                               | Description                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `domainId`                                                             | *string*                                                               | :heavy_check_mark:                                                     | The ID of the domain that will be deleted. Must be a satellite domain. |