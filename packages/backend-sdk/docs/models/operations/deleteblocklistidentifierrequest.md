# DeleteBlocklistIdentifierRequest

## Example Usage

```typescript
import { DeleteBlocklistIdentifierRequest } from "@clerk/backend-sdk/models/operations";

let value: DeleteBlocklistIdentifierRequest = {
  identifierId: "<id>",
};
```

## Fields

| Field                                                  | Type                                                   | Required                                               | Description                                            |
| ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ |
| `identifierId`                                         | *string*                                               | :heavy_check_mark:                                     | The ID of the identifier to delete from the block-list |