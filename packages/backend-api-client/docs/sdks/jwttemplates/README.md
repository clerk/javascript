# JwtTemplates
(*jwtTemplates*)

## Overview

### Available Operations

* [list](#list) - List all templates
* [create](#create) - Create a JWT template
* [get](#get) - Retrieve a template
* [update](#update) - Update a JWT template
* [delete](#delete) - Delete a Template

## list

List all templates

### Example Usage

```typescript
import { ClerkBackendApi } from "@clerk/backend-api-client";

const clerkBackendApi = new ClerkBackendApi({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const result = await clerkBackendApi.jwtTemplates.list({});

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkBackendApiCore } from "@clerk/backend-api-client/core.js";
import { jwtTemplatesList } from "@clerk/backend-api-client/funcs/jwtTemplatesList.js";

// Use `ClerkBackendApiCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerkBackendApi = new ClerkBackendApiCore({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const res = await jwtTemplatesList(clerkBackendApi, {});

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.ListJWTTemplatesRequest](../../models/operations/listjwttemplatesrequest.md)                                                                                       | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.JWTTemplate[]](../../models/.md)\>**

### Errors

| Error Type           | Status Code          | Content Type         |
| -------------------- | -------------------- | -------------------- |
| errors.ClerkAPIError | 4XX, 5XX             | \*/\*                |

## create

Create a new JWT template

### Example Usage

```typescript
import { ClerkBackendApi } from "@clerk/backend-api-client";

const clerkBackendApi = new ClerkBackendApi({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const result = await clerkBackendApi.jwtTemplates.create();

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkBackendApiCore } from "@clerk/backend-api-client/core.js";
import { jwtTemplatesCreate } from "@clerk/backend-api-client/funcs/jwtTemplatesCreate.js";

// Use `ClerkBackendApiCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerkBackendApi = new ClerkBackendApiCore({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const res = await jwtTemplatesCreate(clerkBackendApi);

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.CreateJWTTemplateRequestBody](../../models/operations/createjwttemplaterequestbody.md)                                                                             | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.JWTTemplate](../../models/components/jwttemplate.md)\>**

### Errors

| Error Type           | Status Code          | Content Type         |
| -------------------- | -------------------- | -------------------- |
| errors.ClerkErrors   | 400, 402, 422        | application/json     |
| errors.ClerkAPIError | 4XX, 5XX             | \*/\*                |

## get

Retrieve the details of a given JWT template

### Example Usage

```typescript
import { ClerkBackendApi } from "@clerk/backend-api-client";

const clerkBackendApi = new ClerkBackendApi({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const result = await clerkBackendApi.jwtTemplates.get("<id>");

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkBackendApiCore } from "@clerk/backend-api-client/core.js";
import { jwtTemplatesGet } from "@clerk/backend-api-client/funcs/jwtTemplatesGet.js";

// Use `ClerkBackendApiCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerkBackendApi = new ClerkBackendApiCore({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const res = await jwtTemplatesGet(clerkBackendApi, "<id>");

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `templateId`                                                                                                                                                                   | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | JWT Template ID                                                                                                                                                                |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.JWTTemplate](../../models/components/jwttemplate.md)\>**

### Errors

| Error Type           | Status Code          | Content Type         |
| -------------------- | -------------------- | -------------------- |
| errors.ClerkErrors   | 404                  | application/json     |
| errors.ClerkAPIError | 4XX, 5XX             | \*/\*                |

## update

Updates an existing JWT template

### Example Usage

```typescript
import { ClerkBackendApi } from "@clerk/backend-api-client";

const clerkBackendApi = new ClerkBackendApi({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const result = await clerkBackendApi.jwtTemplates.update({
    templateId: "<id>",
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkBackendApiCore } from "@clerk/backend-api-client/core.js";
import { jwtTemplatesUpdate } from "@clerk/backend-api-client/funcs/jwtTemplatesUpdate.js";

// Use `ClerkBackendApiCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerkBackendApi = new ClerkBackendApiCore({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const res = await jwtTemplatesUpdate(clerkBackendApi, {
    templateId: "<id>",
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.UpdateJWTTemplateRequest](../../models/operations/updatejwttemplaterequest.md)                                                                                     | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.JWTTemplate](../../models/components/jwttemplate.md)\>**

### Errors

| Error Type           | Status Code          | Content Type         |
| -------------------- | -------------------- | -------------------- |
| errors.ClerkErrors   | 400, 402, 422        | application/json     |
| errors.ClerkAPIError | 4XX, 5XX             | \*/\*                |

## delete

Delete a Template

### Example Usage

```typescript
import { ClerkBackendApi } from "@clerk/backend-api-client";

const clerkBackendApi = new ClerkBackendApi({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const result = await clerkBackendApi.jwtTemplates.delete("<id>");

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkBackendApiCore } from "@clerk/backend-api-client/core.js";
import { jwtTemplatesDelete } from "@clerk/backend-api-client/funcs/jwtTemplatesDelete.js";

// Use `ClerkBackendApiCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerkBackendApi = new ClerkBackendApiCore({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const res = await jwtTemplatesDelete(clerkBackendApi, "<id>");

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `templateId`                                                                                                                                                                   | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | JWT Template ID                                                                                                                                                                |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.DeletedObject](../../models/components/deletedobject.md)\>**

### Errors

| Error Type           | Status Code          | Content Type         |
| -------------------- | -------------------- | -------------------- |
| errors.ClerkErrors   | 403, 404             | application/json     |
| errors.ClerkAPIError | 4XX, 5XX             | \*/\*                |