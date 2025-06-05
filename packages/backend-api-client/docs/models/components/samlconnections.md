# SAMLConnections

A list of SAML Connections

## Example Usage

```typescript
import { SAMLConnections } from "@clerk/backend-api-client/models/components";

let value: SAMLConnections = {
  data: [
    {
      object: "saml_connection",
      id: "<id>",
      name: "<value>",
      domain: "webbed-innovation.info",
      idpEntityId: "<id>",
      idpSsoUrl: "https://close-cauliflower.com/",
      idpCertificate: "<value>",
      acsUrl: "https://prestigious-zebra.org/",
      spEntityId: "<id>",
      spMetadataUrl: "https://tedious-vanadyl.biz",
      active: false,
      provider: "<value>",
      userCount: 698685,
      syncUserAttributes: false,
      createdAt: 871978,
      updatedAt: 34863,
    },
  ],
  totalCount: 755550,
};
```

## Fields

| Field                                                                                  | Type                                                                                   | Required                                                                               | Description                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `data`                                                                                 | [components.SchemasSAMLConnection](../../models/components/schemassamlconnection.md)[] | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `totalCount`                                                                           | *number*                                                                               | :heavy_check_mark:                                                                     | Total number of SAML Connections<br/>                                                  |