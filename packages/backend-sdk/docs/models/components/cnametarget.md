# CNameTarget

## Example Usage

```typescript
import { CNameTarget } from "@clerk/backend-sdk/models/components";

let value: CNameTarget = {
  host: "rapid-league.info",
  value: "<value>",
  required: false,
};
```

## Fields

| Field                                                                                                       | Type                                                                                                        | Required                                                                                                    | Description                                                                                                 |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `host`                                                                                                      | *string*                                                                                                    | :heavy_check_mark:                                                                                          | N/A                                                                                                         |
| `value`                                                                                                     | *string*                                                                                                    | :heavy_check_mark:                                                                                          | N/A                                                                                                         |
| `required`                                                                                                  | *boolean*                                                                                                   | :heavy_check_mark:                                                                                          | Denotes whether this CNAME target is required to be set in order for the domain to be considered deployed.<br/> |