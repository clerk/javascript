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
      emailAddress: "Oma74@yahoo.com",
      status: "pending",
      createdAt: 935833,
      updatedAt: 983427,
      invitation: {
        object: "invitation",
        id: "<id>",
        emailAddress: "Geo_Paucek86@yahoo.com",
        publicMetadata: {
          "key": "<value>",
        },
        revoked: false,
        status: "pending",
        createdAt: 497777,
        updatedAt: 581082,
      },
    },
  ],
  totalCount: 241557,
};
```

## Fields

| Field                                                                  | Type                                                                   | Required                                                               | Description                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `data`                                                                 | [components.WaitlistEntry](../../models/components/waitlistentry.md)[] | :heavy_check_mark:                                                     | N/A                                                                    |
| `totalCount`                                                           | *number*                                                               | :heavy_check_mark:                                                     | Total number of waitlist entries                                       |