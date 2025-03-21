# SchemasSAMLConnection

## Example Usage

```typescript
import { SchemasSAMLConnection } from '@clerk/backend-sdk/models/components';

let value: SchemasSAMLConnection = {
  object: 'saml_connection',
  id: '<id>',
  name: '<value>',
  domain: 'lively-ectoderm.biz',
  idpEntityId: '<id>',
  idpSsoUrl: 'https://hidden-import.info',
  idpCertificate: '<value>',
  acsUrl: 'https://complicated-boyfriend.info',
  spEntityId: '<id>',
  spMetadataUrl: 'https://quick-witted-grouper.org',
  active: false,
  provider: '<value>',
  userCount: 351893,
  syncUserAttributes: false,
  createdAt: 721407,
  updatedAt: 637583,
};
```

## Fields

| Field                              | Type                                                                                                   | Required           | Description                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------ | ----------------------------------- |
| `object`                           | [components.SchemasSAMLConnectionObject](../../models/components/schemassamlconnectionobject.md)       | :heavy_check_mark: | N/A                                 |
| `id`                               | _string_                                                                                               | :heavy_check_mark: | N/A                                 |
| `name`                             | _string_                                                                                               | :heavy_check_mark: | N/A                                 |
| `domain`                           | _string_                                                                                               | :heavy_check_mark: | N/A                                 |
| `idpEntityId`                      | _string_                                                                                               | :heavy_check_mark: | N/A                                 |
| `idpSsoUrl`                        | _string_                                                                                               | :heavy_check_mark: | N/A                                 |
| `idpCertificate`                   | _string_                                                                                               | :heavy_check_mark: | N/A                                 |
| `idpMetadataUrl`                   | _string_                                                                                               | :heavy_minus_sign: | N/A                                 |
| `idpMetadata`                      | _string_                                                                                               | :heavy_minus_sign: | N/A                                 |
| `acsUrl`                           | _string_                                                                                               | :heavy_check_mark: | N/A                                 |
| `spEntityId`                       | _string_                                                                                               | :heavy_check_mark: | N/A                                 |
| `spMetadataUrl`                    | _string_                                                                                               | :heavy_check_mark: | N/A                                 |
| `organizationId`                   | _string_                                                                                               | :heavy_minus_sign: | N/A                                 |
| `attributeMapping`                 | [components.SAMLConnectionAttributeMapping](../../models/components/samlconnectionattributemapping.md) | :heavy_minus_sign: | N/A                                 |
| `active`                           | _boolean_                                                                                              | :heavy_check_mark: | N/A                                 |
| `provider`                         | _string_                                                                                               | :heavy_check_mark: | N/A                                 |
| `userCount`                        | _number_                                                                                               | :heavy_check_mark: | N/A                                 |
| `syncUserAttributes`               | _boolean_                                                                                              | :heavy_check_mark: | N/A                                 |
| `allowSubdomains`                  | _boolean_                                                                                              | :heavy_minus_sign: | N/A                                 |
| `allowIdpInitiated`                | _boolean_                                                                                              | :heavy_minus_sign: | N/A                                 |
| `disableAdditionalIdentifications` | _boolean_                                                                                              | :heavy_minus_sign: | N/A                                 |
| `createdAt`                        | _number_                                                                                               | :heavy_check_mark: | Unix timestamp of creation.<br/>    |
| `updatedAt`                        | _number_                                                                                               | :heavy_check_mark: | Unix timestamp of last update.<br/> |
