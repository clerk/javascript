# UpdateDomainRequest

## Example Usage

```typescript
import { UpdateDomainRequest } from '@clerk/backend-sdk/models/operations';

let value: UpdateDomainRequest = {
  domainId: '<id>',
  requestBody: {},
};
```

## Fields

| Field         | Type                                                                                     | Required           | Description                                |
| ------------- | ---------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------ |
| `domainId`    | _string_                                                                                 | :heavy_check_mark: | The ID of the domain that will be updated. |
| `requestBody` | [operations.UpdateDomainRequestBody](../../models/operations/updatedomainrequestbody.md) | :heavy_check_mark: | N/A                                        |
