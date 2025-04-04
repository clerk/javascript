# CreateRedirectURLRequestBody

## Example Usage

```typescript
import { CreateRedirectURLRequestBody } from "@clerk/backend-api-client/models/operations";

let value: CreateRedirectURLRequestBody = {
  url: "https://white-scrap.com/",
};
```

## Fields

| Field                                                                                                                                    | Type                                                                                                                                     | Required                                                                                                                                 | Description                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                                                                                                                                    | *string*                                                                                                                                 | :heavy_check_mark:                                                                                                                       | The full url value prefixed with `https://` or a custom scheme e.g. `"https://my-app.com/oauth-callback"` or `"my-app://oauth-callback"` |