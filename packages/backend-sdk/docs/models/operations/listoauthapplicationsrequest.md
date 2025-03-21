# ListOAuthApplicationsRequest

## Example Usage

```typescript
import { ListOAuthApplicationsRequest } from '@clerk/backend-sdk/models/operations';

let value: ListOAuthApplicationsRequest = {};
```

## Fields

| Field    | Type     | Required           | Description                                                                                                                                       |
| -------- | -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `limit`  | _number_ | :heavy_minus_sign: | Applies a limit to the number of results returned.<br/>Can be used for paginating the results together with `offset`.                             |
| `offset` | _number_ | :heavy_minus_sign: | Skip the first `offset` results when paginating.<br/>Needs to be an integer greater or equal to zero.<br/>To be used in conjunction with `limit`. |
