# Template

Success

## Example Usage

```typescript
import { Template } from '@clerk/backend-sdk/models/components';

let value: Template = {};
```

## Fields

| Field                | Type                                                                   | Required           | Description                                                                                |
| -------------------- | ---------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| `id`                 | _string_                                                               | :heavy_minus_sign: | N/A                                                                                        |
| `object`             | [components.TemplateObject](../../models/components/templateobject.md) | :heavy_minus_sign: | String representing the object's type. Objects of the same type share the same value.<br/> |
| `instanceId`         | _string_                                                               | :heavy_minus_sign: | the id of the instance the template belongs to                                             |
| `resourceType`       | _string_                                                               | :heavy_minus_sign: | whether this is a system (default) or user overridden) template                            |
| `templateType`       | _string_                                                               | :heavy_minus_sign: | whether this is an email or SMS template                                                   |
| `name`               | _string_                                                               | :heavy_minus_sign: | user-friendly name of the template                                                         |
| `slug`               | _string_                                                               | :heavy_minus_sign: | machine-friendly name of the template                                                      |
| `position`           | _number_                                                               | :heavy_minus_sign: | position with the listing of templates                                                     |
| `canRevert`          | _boolean_                                                              | :heavy_minus_sign: | whether this template can be reverted to the corresponding system default                  |
| `canDelete`          | _boolean_                                                              | :heavy_minus_sign: | whether this template can be deleted                                                       |
| `canToggle`          | _boolean_                                                              | :heavy_minus_sign: | whether this template can be enabled or disabled, true only for notification SMS templates |
| `subject`            | _string_                                                               | :heavy_minus_sign: | email subject                                                                              |
| `markup`             | _string_                                                               | :heavy_minus_sign: | the editor markup used to generate the body of the template                                |
| `body`               | _string_                                                               | :heavy_minus_sign: | the template body before variable interpolation                                            |
| `availableVariables` | _string_[]                                                             | :heavy_minus_sign: | list of variables that are available for use in the template body                          |
| `requiredVariables`  | _string_[]                                                             | :heavy_minus_sign: | list of variables that must be contained in the template body                              |
| `fromEmailName`      | _string_                                                               | :heavy_minus_sign: | N/A                                                                                        |
| `replyToEmailName`   | _string_                                                               | :heavy_minus_sign: | N/A                                                                                        |
| `deliveredByClerk`   | _boolean_                                                              | :heavy_minus_sign: | N/A                                                                                        |
| `enabled`            | _boolean_                                                              | :heavy_minus_sign: | N/A                                                                                        |
| `updatedAt`          | _number_                                                               | :heavy_minus_sign: | Unix timestamp of last update.<br/>                                                        |
| `createdAt`          | _number_                                                               | :heavy_minus_sign: | Unix timestamp of creation.<br/>                                                           |
