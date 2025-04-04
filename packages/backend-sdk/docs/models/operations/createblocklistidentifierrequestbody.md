# CreateBlocklistIdentifierRequestBody

## Example Usage

```typescript
import { CreateBlocklistIdentifierRequestBody } from "@clerk/backend-sdk/models/operations";

let value: CreateBlocklistIdentifierRequestBody = {
  identifier: "<value>",
};
```

## Fields

| Field                                                                                                        | Type                                                                                                         | Required                                                                                                     | Description                                                                                                  |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `identifier`                                                                                                 | *string*                                                                                                     | :heavy_check_mark:                                                                                           | The identifier to be added in the block-list.<br/>This can be an email address, a phone number or a web3 wallet. |