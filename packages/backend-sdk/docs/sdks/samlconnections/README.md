# SamlConnections

(_samlConnections_)

## Overview

### Available Operations

- [list](#list) - Get a list of SAML Connections for an instance
- [create](#create) - Create a SAML Connection
- [get](#get) - Retrieve a SAML Connection by ID
- [update](#update) - Update a SAML Connection
- [delete](#delete) - Delete a SAML Connection

## list

Returns the list of SAML Connections for an instance.
Results can be paginated using the optional `limit` and `offset` query parameters.
The SAML Connections are ordered by descending creation date and the most recent will be returned first.

### Example Usage

```typescript
import { Clerk } from '@clerk/backend-sdk';

const clerk = new Clerk({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const result = await clerk.samlConnections.list({});

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkCore } from '@clerk/backend-sdk/core.js';
import { samlConnectionsList } from '@clerk/backend-sdk/funcs/samlConnectionsList.js';

// Use `ClerkCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerk = new ClerkCore({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const res = await samlConnectionsList(clerk, {});

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

| Parameter              | Type                                                                                           | Required           | Description                                                                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`              | [operations.ListSAMLConnectionsRequest](../../models/operations/listsamlconnectionsrequest.md) | :heavy_check_mark: | The request object to use for the request.                                                                                                                                     |
| `options`              | RequestOptions                                                                                 | :heavy_minus_sign: | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions` | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)        | :heavy_minus_sign: | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`      | [RetryConfig](../../lib/utils/retryconfig.md)                                                  | :heavy_minus_sign: | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.SAMLConnections](../../models/components/samlconnections.md)\>**

### Errors

| Error Type         | Status Code   | Content Type     |
| ------------------ | ------------- | ---------------- |
| errors.ClerkErrors | 402, 403, 422 | application/json |
| errors.APIError    | 4XX, 5XX      | \*/\*            |

## create

Create a new SAML Connection.

### Example Usage

```typescript
import { Clerk } from '@clerk/backend-sdk';

const clerk = new Clerk({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const result = await clerk.samlConnections.create();

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkCore } from '@clerk/backend-sdk/core.js';
import { samlConnectionsCreate } from '@clerk/backend-sdk/funcs/samlConnectionsCreate.js';

// Use `ClerkCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerk = new ClerkCore({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const res = await samlConnectionsCreate(clerk);

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

| Parameter              | Type                                                                                                     | Required           | Description                                                                                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`              | [operations.CreateSAMLConnectionRequestBody](../../models/operations/createsamlconnectionrequestbody.md) | :heavy_check_mark: | The request object to use for the request.                                                                                                                                     |
| `options`              | RequestOptions                                                                                           | :heavy_minus_sign: | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions` | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                  | :heavy_minus_sign: | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`      | [RetryConfig](../../lib/utils/retryconfig.md)                                                            | :heavy_minus_sign: | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.SchemasSAMLConnection](../../models/components/schemassamlconnection.md)\>**

### Errors

| Error Type         | Status Code        | Content Type     |
| ------------------ | ------------------ | ---------------- |
| errors.ClerkErrors | 402, 403, 404, 422 | application/json |
| errors.APIError    | 4XX, 5XX           | \*/\*            |

## get

Fetches the SAML Connection whose ID matches the provided `saml_connection_id` in the path.

### Example Usage

```typescript
import { Clerk } from '@clerk/backend-sdk';

const clerk = new Clerk({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const result = await clerk.samlConnections.get({
    samlConnectionId: '<id>',
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkCore } from '@clerk/backend-sdk/core.js';
import { samlConnectionsGet } from '@clerk/backend-sdk/funcs/samlConnectionsGet.js';

// Use `ClerkCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerk = new ClerkCore({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const res = await samlConnectionsGet(clerk, {
    samlConnectionId: '<id>',
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

| Parameter              | Type                                                                                       | Required           | Description                                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`              | [operations.GetSAMLConnectionRequest](../../models/operations/getsamlconnectionrequest.md) | :heavy_check_mark: | The request object to use for the request.                                                                                                                                     |
| `options`              | RequestOptions                                                                             | :heavy_minus_sign: | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions` | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)    | :heavy_minus_sign: | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`      | [RetryConfig](../../lib/utils/retryconfig.md)                                              | :heavy_minus_sign: | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.SchemasSAMLConnection](../../models/components/schemassamlconnection.md)\>**

### Errors

| Error Type         | Status Code   | Content Type     |
| ------------------ | ------------- | ---------------- |
| errors.ClerkErrors | 402, 403, 404 | application/json |
| errors.APIError    | 4XX, 5XX      | \*/\*            |

## update

Updates the SAML Connection whose ID matches the provided `id` in the path.

### Example Usage

```typescript
import { Clerk } from '@clerk/backend-sdk';

const clerk = new Clerk({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const result = await clerk.samlConnections.update({
    samlConnectionId: '<id>',
    requestBody: {},
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkCore } from '@clerk/backend-sdk/core.js';
import { samlConnectionsUpdate } from '@clerk/backend-sdk/funcs/samlConnectionsUpdate.js';

// Use `ClerkCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerk = new ClerkCore({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const res = await samlConnectionsUpdate(clerk, {
    samlConnectionId: '<id>',
    requestBody: {},
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

| Parameter              | Type                                                                                             | Required           | Description                                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`              | [operations.UpdateSAMLConnectionRequest](../../models/operations/updatesamlconnectionrequest.md) | :heavy_check_mark: | The request object to use for the request.                                                                                                                                     |
| `options`              | RequestOptions                                                                                   | :heavy_minus_sign: | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions` | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)          | :heavy_minus_sign: | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`      | [RetryConfig](../../lib/utils/retryconfig.md)                                                    | :heavy_minus_sign: | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.SchemasSAMLConnection](../../models/components/schemassamlconnection.md)\>**

### Errors

| Error Type         | Status Code        | Content Type     |
| ------------------ | ------------------ | ---------------- |
| errors.ClerkErrors | 402, 403, 404, 422 | application/json |
| errors.APIError    | 4XX, 5XX           | \*/\*            |

## delete

Deletes the SAML Connection whose ID matches the provided `id` in the path.

### Example Usage

```typescript
import { Clerk } from '@clerk/backend-sdk';

const clerk = new Clerk({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const result = await clerk.samlConnections.delete({
    samlConnectionId: '<id>',
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkCore } from '@clerk/backend-sdk/core.js';
import { samlConnectionsDelete } from '@clerk/backend-sdk/funcs/samlConnectionsDelete.js';

// Use `ClerkCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerk = new ClerkCore({
  bearerAuth: process.env['CLERK_BEARER_AUTH'] ?? '',
});

async function run() {
  const res = await samlConnectionsDelete(clerk, {
    samlConnectionId: '<id>',
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

| Parameter              | Type                                                                                             | Required           | Description                                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`              | [operations.DeleteSAMLConnectionRequest](../../models/operations/deletesamlconnectionrequest.md) | :heavy_check_mark: | The request object to use for the request.                                                                                                                                     |
| `options`              | RequestOptions                                                                                   | :heavy_minus_sign: | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions` | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)          | :heavy_minus_sign: | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`      | [RetryConfig](../../lib/utils/retryconfig.md)                                                    | :heavy_minus_sign: | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.DeletedObject](../../models/components/deletedobject.md)\>**

### Errors

| Error Type         | Status Code   | Content Type     |
| ------------------ | ------------- | ---------------- |
| errors.ClerkErrors | 402, 403, 404 | application/json |
| errors.APIError    | 4XX, 5XX      | \*/\*            |
