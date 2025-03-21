# GetSessionListRequest

## Example Usage

```typescript
import { GetSessionListRequest } from '@clerk/backend-sdk/models/operations';

let value: GetSessionListRequest = {};
```

## Fields

| Field       | Type                                                   | Required           | Description                                                                                                                                       |
| ----------- | ------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clientId`  | _string_                                               | :heavy_minus_sign: | List sessions for the given client                                                                                                                |
| `userId`    | _string_                                               | :heavy_minus_sign: | List sessions for the given user                                                                                                                  |
| `status`    | [operations.Status](../../models/operations/status.md) | :heavy_minus_sign: | Filter sessions by the provided status                                                                                                            |
| `paginated` | _boolean_                                              | :heavy_minus_sign: | Whether to paginate the results.<br/>If true, the results will be paginated.<br/>If false, the results will not be paginated.                     |
| `limit`     | _number_                                               | :heavy_minus_sign: | Applies a limit to the number of results returned.<br/>Can be used for paginating the results together with `offset`.                             |
| `offset`    | _number_                                               | :heavy_minus_sign: | Skip the first `offset` results when paginating.<br/>Needs to be an integer greater or equal to zero.<br/>To be used in conjunction with `limit`. |
