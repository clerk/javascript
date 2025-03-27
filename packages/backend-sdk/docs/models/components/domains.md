# Domains

A list of domains

## Example Usage

```typescript
import { Domains } from "@clerk/backend-sdk/models/components";

let value: Domains = {
  data: [
    {
      object: "domain",
      id: "<id>",
      name: "<value>",
      isSatellite: false,
      frontendApiUrl: "https://lustrous-wombat.com",
      developmentOrigin: "<value>",
    },
  ],
  totalCount: 783235,
};
```

## Fields

| Field                                                    | Type                                                     | Required                                                 | Description                                              |
| -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| `data`                                                   | [components.Domain](../../models/components/domain.md)[] | :heavy_check_mark:                                       | N/A                                                      |
| `totalCount`                                             | *number*                                                 | :heavy_check_mark:                                       | Total number of domains<br/>                             |