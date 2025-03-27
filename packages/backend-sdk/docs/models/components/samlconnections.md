# SAMLConnections

A list of SAML Connections

## Example Usage

```typescript
import { SAMLConnections } from "@clerk/backend-sdk/models/components";

let value: SAMLConnections = {
  data: [
    {
      object: "saml_connection",
      id: "<id>",
      name: "<value>",
      domain: "bustling-flood.name",
      idpEntityId: "<id>",
      idpSsoUrl: "https://impassioned-zen.info",
      idpCertificate: "<value>",
      acsUrl: "https://private-silk.org",
      spEntityId: "<id>",
      spMetadataUrl: "https://sneaky-precedent.info",
      active: false,
      provider: "<value>",
      userCount: 147685,
      syncUserAttributes: false,
      createdAt: 62636,
      updatedAt: 241901,
    },
  ],
  totalCount: 432281,
};
```

## Fields

| Field                                                                                  | Type                                                                                   | Required                                                                               | Description                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `data`                                                                                 | [components.SchemasSAMLConnection](../../models/components/schemassamlconnection.md)[] | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `totalCount`                                                                           | *number*                                                                               | :heavy_check_mark:                                                                     | Total number of SAML Connections<br/>                                                  |