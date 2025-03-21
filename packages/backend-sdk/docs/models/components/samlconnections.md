# SAMLConnections

A list of SAML Connections

## Example Usage

```typescript
import { SAMLConnections } from '@clerk/backend-sdk/models/components';

let value: SAMLConnections = {
  data: [
    {
      object: 'saml_connection',
      id: '<id>',
      name: '<value>',
      domain: 'appropriate-bakeware.com',
      idpEntityId: '<id>',
      idpSsoUrl: 'https://showy-tectonics.net',
      idpCertificate: '<value>',
      acsUrl: 'https://frugal-yogurt.info',
      spEntityId: '<id>',
      spMetadataUrl: 'https://humiliating-waterspout.biz/',
      active: false,
      provider: '<value>',
      userCount: 327988,
      syncUserAttributes: false,
      createdAt: 680349,
      updatedAt: 63207,
    },
  ],
  totalCount: 607249,
};
```

## Fields

| Field        | Type                                                                                   | Required           | Description                           |
| ------------ | -------------------------------------------------------------------------------------- | ------------------ | ------------------------------------- |
| `data`       | [components.SchemasSAMLConnection](../../models/components/schemassamlconnection.md)[] | :heavy_check_mark: | N/A                                   |
| `totalCount` | _number_                                                                               | :heavy_check_mark: | Total number of SAML Connections<br/> |
