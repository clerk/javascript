# TestingToken

A Testing Token

## Example Usage

```typescript
import { TestingToken } from "@clerk/backend-api-client/models/components";

let value: TestingToken = {
  object: "testing_token",
  token: "1713877200-c_2J2MvPu9PnXcuhbPZNao0LOXqK9A7YrnBn0HmIWxy",
  expiresAt: 1713880800,
};
```

## Fields

| Field                                                                                                                                | Type                                                                                                                                 | Required                                                                                                                             | Description                                                                                                                          | Example                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `object`                                                                                                                             | [components.TestingTokenObject](../../models/components/testingtokenobject.md)                                                       | :heavy_check_mark:                                                                                                                   | N/A                                                                                                                                  |                                                                                                                                      |
| `token`                                                                                                                              | *string*                                                                                                                             | :heavy_check_mark:                                                                                                                   | The actual token. This value is meant to be passed in the `__clerk_testing_token` query parameter with requests to the Frontend API. | 1713877200-c_2J2MvPu9PnXcuhbPZNao0LOXqK9A7YrnBn0HmIWxy                                                                               |
| `expiresAt`                                                                                                                          | *number*                                                                                                                             | :heavy_check_mark:                                                                                                                   | Unix timestamp of the token's expiration time.<br/>                                                                                  | 1713880800                                                                                                                           |