# DeleteSAMLConnectionRequest

## Example Usage

```typescript
import { DeleteSAMLConnectionRequest } from "@clerk/backend-api-client/models/operations";

let value: DeleteSAMLConnectionRequest = {
  samlConnectionId: "<id>",
};
```

## Fields

| Field                                   | Type                                    | Required                                | Description                             |
| --------------------------------------- | --------------------------------------- | --------------------------------------- | --------------------------------------- |
| `samlConnectionId`                      | *string*                                | :heavy_check_mark:                      | The ID of the SAML Connection to delete |