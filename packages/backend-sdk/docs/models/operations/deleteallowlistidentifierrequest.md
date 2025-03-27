# DeleteAllowlistIdentifierRequest

## Example Usage

```typescript
import { DeleteAllowlistIdentifierRequest } from "@clerk/backend-sdk/models/operations";

let value: DeleteAllowlistIdentifierRequest = {
  identifierId: "<id>",
};
```

## Fields

| Field                                                  | Type                                                   | Required                                               | Description                                            |
| ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ |
| `identifierId`                                         | *string*                                               | :heavy_check_mark:                                     | The ID of the identifier to delete from the allow-list |