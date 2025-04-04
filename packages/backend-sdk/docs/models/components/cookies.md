# Cookies

## Example Usage

```typescript
import { Cookies } from "@clerk/backend-sdk/models/components";

let value: Cookies = {
  object: "cookies",
  cookies: [
    "<value>",
  ],
};
```

## Fields

| Field                                                                                 | Type                                                                                  | Required                                                                              | Description                                                                           |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `object`                                                                              | [components.CookiesObject](../../models/components/cookiesobject.md)                  | :heavy_check_mark:                                                                    | String representing the object's type. Objects of the same type share the same value. |
| `cookies`                                                                             | *string*[]                                                                            | :heavy_check_mark:                                                                    | Array of cookie directives.                                                           |