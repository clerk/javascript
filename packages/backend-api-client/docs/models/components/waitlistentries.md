# WaitlistEntries

List of waitlist entries

## Example Usage

```typescript
import { WaitlistEntries } from "@clerk/backend-api-client/models/components";

let value: WaitlistEntries = {
  data: [
    {
      object: "waitlist_entry",
      id: "<id>",
      emailAddress: "Carolyn.Emmerich@gmail.com",
      status: "pending",
      createdAt: 270195,
      updatedAt: 959295,
      invitation: {
        object: "invitation",
        id: "<id>",
        emailAddress: "Manley57@yahoo.com",
        publicMetadata: {
          "key": "<value>",
        },
        revoked: false,
        status: "pending",
        createdAt: 62691,
        updatedAt: 931861,
      },
    },
  ],
  totalCount: 951524,
};
```

## Fields

| Field                                                                  | Type                                                                   | Required                                                               | Description                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `data`                                                                 | [components.WaitlistEntry](../../models/components/waitlistentry.md)[] | :heavy_check_mark:                                                     | N/A                                                                    |
| `totalCount`                                                           | *number*                                                               | :heavy_check_mark:                                                     | Total number of waitlist entries                                       |