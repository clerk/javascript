# UpdateSAMLConnectionRequestBody

## Example Usage

```typescript
import { UpdateSAMLConnectionRequestBody } from '@clerk/backend-sdk/models/operations';

let value: UpdateSAMLConnectionRequestBody = {};
```

## Fields

| Field                              | Type                                                                                                               | Required           | Description                                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `name`                             | _string_                                                                                                           | :heavy_minus_sign: | The name of the new SAML Connection                                                                                                 |
| `domain`                           | _string_                                                                                                           | :heavy_minus_sign: | The domain to use for the new SAML Connection                                                                                       |
| `idpEntityId`                      | _string_                                                                                                           | :heavy_minus_sign: | The entity id as provided by the IdP                                                                                                |
| `idpSsoUrl`                        | _string_                                                                                                           | :heavy_minus_sign: | The SSO url as provided by the IdP                                                                                                  |
| `idpCertificate`                   | _string_                                                                                                           | :heavy_minus_sign: | The x509 certificated as provided by the IdP                                                                                        |
| `idpMetadataUrl`                   | _string_                                                                                                           | :heavy_minus_sign: | The URL which serves the IdP metadata. If present, it takes priority over the corresponding individual properties and replaces them |
| `idpMetadata`                      | _string_                                                                                                           | :heavy_minus_sign: | The XML content of the IdP metadata file. If present, it takes priority over the corresponding individual properties                |
| `organizationId`                   | _string_                                                                                                           | :heavy_minus_sign: | The ID of the organization to which users of this SAML Connection will be added                                                     |
| `attributeMapping`                 | [operations.UpdateSAMLConnectionAttributeMapping](../../models/operations/updatesamlconnectionattributemapping.md) | :heavy_minus_sign: | Define the atrtibute name mapping between Identity Provider and Clerk's user properties                                             |
| `active`                           | _boolean_                                                                                                          | :heavy_minus_sign: | Activate or de-activate the SAML Connection                                                                                         |
| `syncUserAttributes`               | _boolean_                                                                                                          | :heavy_minus_sign: | Controls whether to update the user's attributes in each sign-in                                                                    |
| `allowSubdomains`                  | _boolean_                                                                                                          | :heavy_minus_sign: | Allow users with an email address subdomain to use this connection in order to authenticate                                         |
| `allowIdpInitiated`                | _boolean_                                                                                                          | :heavy_minus_sign: | Enable or deactivate IdP-initiated flows                                                                                            |
| `disableAdditionalIdentifications` | _boolean_                                                                                                          | :heavy_minus_sign: | Enable or deactivate additional identifications                                                                                     |
