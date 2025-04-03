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
      domain: "impassioned-zen.info",
      idpEntityId: "<id>",
      idpSsoUrl: "https://private-silk.org",
      idpCertificate: "<value>",
      acsUrl: "https://sneaky-precedent.info",
      spEntityId: "<id>",
      spMetadataUrl: "https://beneficial-desk.info/",
      active: false,
      provider: "<value>",
      userCount: 521996,
      syncUserAttributes: false,
      createdAt: 773084,
      updatedAt: 958741,
    },
  ],
  totalCount: 117320,
};
```

## Fields

| Field                                                                                  | Type                                                                                   | Required                                                                               | Description                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `data`                                                                                 | [components.SchemasSAMLConnection](../../models/components/schemassamlconnection.md)[] | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `totalCount`                                                                           | *number*                                                                               | :heavy_check_mark:                                                                     | Total number of SAML Connections<br/>                                                  |