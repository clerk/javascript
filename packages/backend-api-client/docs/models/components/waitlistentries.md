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
      emailAddress: "Margaret_Ratke@yahoo.com",
      status: "pending",
      createdAt: 614528,
      updatedAt: 70042,
      invitation: {
        object: "invitation",
        id: "<id>",
        emailAddress: "Madalyn.Leuschke@hotmail.com",
        publicMetadata: {
          "key": "<value>",
        },
        revoked: false,
        status: "pending",
        createdAt: 321043,
        updatedAt: 29950,
      },
    },
  ],
  totalCount: 737254,
};
```

## Fields

| Field                                                                  | Type                                                                   | Required                                                               | Description                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `data`                                                                 | [components.WaitlistEntry](../../models/components/waitlistentry.md)[] | :heavy_check_mark:                                                     | N/A                                                                    |
| `totalCount`                                                           | *number*                                                               | :heavy_check_mark:                                                     | Total number of waitlist entries                                       |