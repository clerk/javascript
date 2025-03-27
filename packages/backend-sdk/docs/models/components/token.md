# Token

## Example Usage

```typescript
import { Token } from "@clerk/backend-sdk/models/components";

let value: Token = {
  object: "token",
  jwt: "<value>",
};
```

## Fields

| Field                                                                                  | Type                                                                                   | Required                                                                               | Description                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `object`                                                                               | [components.TokenObject](../../models/components/tokenobject.md)                       | :heavy_check_mark:                                                                     | String representing the object's type. Objects of the same type share the same value.<br/> |
| `jwt`                                                                                  | *string*                                                                               | :heavy_check_mark:                                                                     | String representing the encoded jwt value.<br/>                                        |