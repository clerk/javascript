# WaitlistEntries

List of waitlist entries

## Example Usage

```typescript
import { WaitlistEntries } from "@clerk/backend-sdk/models/components";

let value: WaitlistEntries = {
  data: [
    {
      object: "waitlist_entry",
      id: "<id>",
      emailAddress: "Donavon34@gmail.com",
      status: "pending",
      createdAt: 639187,
      updatedAt: 399161,
      invitation: {
        object: "invitation",
        id: "<id>",
        emailAddress: "Leta_Schuster@yahoo.com",
        publicMetadata: {
          "key": "<value>",
        },
        revoked: false,
        status: "pending",
        createdAt: 110477,
        updatedAt: 405036,
      },
    },
  ],
  totalCount: 405373,
};
```

## Fields

| Field                                                                  | Type                                                                   | Required                                                               | Description                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `data`                                                                 | [components.WaitlistEntry](../../models/components/waitlistentry.md)[] | :heavy_check_mark:                                                     | N/A                                                                    |
| `totalCount`                                                           | *number*                                                               | :heavy_check_mark:                                                     | Total number of waitlist entries                                       |