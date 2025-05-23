# DeleteOrganizationLogoRequest

## Example Usage

```typescript
import { DeleteOrganizationLogoRequest } from "@clerk/backend-api-client/models/operations";

let value: DeleteOrganizationLogoRequest = {
  organizationId: "<id>",
};
```

## Fields

| Field                                                          | Type                                                           | Required                                                       | Description                                                    |
| -------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| `organizationId`                                               | *string*                                                       | :heavy_check_mark:                                             | The ID of the organization for which the logo will be deleted. |