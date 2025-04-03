# Domains

A list of domains

## Example Usage

```typescript
import { Domains } from "@clerk/backend-api-client/models/components";

let value: Domains = {
  data: [
    {
      object: "domain",
      id: "<id>",
      name: "<value>",
      isSatellite: false,
      frontendApiUrl: "https://big-scenario.biz",
      developmentOrigin: "<value>",
    },
  ],
  totalCount: 241418,
};
```

## Fields

| Field                                                    | Type                                                     | Required                                                 | Description                                              |
| -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| `data`                                                   | [components.Domain](../../models/components/domain.md)[] | :heavy_check_mark:                                       | N/A                                                      |
| `totalCount`                                             | *number*                                                 | :heavy_check_mark:                                       | Total number of domains<br/>                             |