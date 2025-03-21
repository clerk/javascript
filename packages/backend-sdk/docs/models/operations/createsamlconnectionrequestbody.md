# CreateSAMLConnectionRequestBody

## Example Usage

```typescript
import { CreateSAMLConnectionRequestBody } from '@clerk/backend-sdk/models/operations';

let value: CreateSAMLConnectionRequestBody = {
  name: '<value>',
  domain: 'pale-milestone.biz',
  provider: 'saml_microsoft',
};
```

## Fields

| Field              | Type                                                                       | Required           | Description                                                                                                          |
| ------------------ | -------------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `name`             | _string_                                                                   | :heavy_check_mark: | The name to use as a label for this SAML Connection                                                                  |
| `domain`           | _string_                                                                   | :heavy_check_mark: | The domain of your organization. Sign in flows using an email with this domain, will use this SAML Connection.       |
| `provider`         | [operations.Provider](../../models/operations/provider.md)                 | :heavy_check_mark: | The IdP provider of the connection.                                                                                  |
| `idpEntityId`      | _string_                                                                   | :heavy_minus_sign: | The Entity ID as provided by the IdP                                                                                 |
| `idpSsoUrl`        | _string_                                                                   | :heavy_minus_sign: | The Single-Sign On URL as provided by the IdP                                                                        |
| `idpCertificate`   | _string_                                                                   | :heavy_minus_sign: | The X.509 certificate as provided by the IdP                                                                         |
| `idpMetadataUrl`   | _string_                                                                   | :heavy_minus_sign: | The URL which serves the IdP metadata. If present, it takes priority over the corresponding individual properties    |
| `idpMetadata`      | _string_                                                                   | :heavy_minus_sign: | The XML content of the IdP metadata file. If present, it takes priority over the corresponding individual properties |
| `organizationId`   | _string_                                                                   | :heavy_minus_sign: | The ID of the organization to which users of this SAML Connection will be added                                      |
| `attributeMapping` | [operations.AttributeMapping](../../models/operations/attributemapping.md) | :heavy_minus_sign: | Define the attribute name mapping between Identity Provider and Clerk's user properties                              |
