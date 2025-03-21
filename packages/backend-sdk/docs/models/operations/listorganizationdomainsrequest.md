# ListOrganizationDomainsRequest

## Example Usage

```typescript
import { ListOrganizationDomainsRequest } from '@clerk/backend-sdk/models/operations';

let value: ListOrganizationDomainsRequest = {
  organizationId: '<id>',
};
```

## Fields

| Field            | Type     | Required           | Description                                                                                                                                       |
| ---------------- | -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `organizationId` | _string_ | :heavy_check_mark: | The organization ID.                                                                                                                              |
| `verified`       | _string_ | :heavy_minus_sign: | Filter domains by their verification status. `true` or `false`                                                                                    |
| `enrollmentMode` | _string_ | :heavy_minus_sign: | Filter domains by their enrollment mode                                                                                                           |
| `limit`          | _number_ | :heavy_minus_sign: | Applies a limit to the number of results returned.<br/>Can be used for paginating the results together with `offset`.                             |
| `offset`         | _number_ | :heavy_minus_sign: | Skip the first `offset` results when paginating.<br/>Needs to be an integer greater or equal to zero.<br/>To be used in conjunction with `limit`. |
