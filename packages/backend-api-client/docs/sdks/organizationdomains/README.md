# OrganizationDomains
(*organizationDomains*)

## Overview

### Available Operations

* [create](#create) - Create a new organization domain.
* [list](#list) - Get a list of all domains of an organization.
* [update](#update) - Update an organization domain.
* [delete](#delete) - Remove a domain from an organization.

## create

Creates a new organization domain. By default the domain is verified, but can be optionally set to unverified.

### Example Usage

```typescript
import { ClerkBackendApi } from "@clerk/backend-api-client";

const clerkBackendApi = new ClerkBackendApi({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const result = await clerkBackendApi.organizationDomains.create({
    organizationId: "<id>",
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
import { ClerkBackendApiCore } from "@clerk/backend-api-client/core.js";
import { organizationDomainsCreate } from "@clerk/backend-api-client/funcs/organizationDomainsCreate.js";

// Use `ClerkBackendApiCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerkBackendApi = new ClerkBackendApiCore({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const res = await organizationDomainsCreate(clerkBackendApi, {
    organizationId: "<id>",
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

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.CreateOrganizationDomainRequest](../../models/operations/createorganizationdomainrequest.md)                                                                       | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.OrganizationDomain](../../models/components/organizationdomain.md)\>**

### Errors

| Error Type           | Status Code          | Content Type         |
| -------------------- | -------------------- | -------------------- |
| errors.ClerkErrors   | 400, 403, 404, 422   | application/json     |
| errors.ClerkAPIError | 4XX, 5XX             | \*/\*                |

## list

Get a list of all domains of an organization.

### Example Usage

```typescript
import { ClerkBackendApi } from "@clerk/backend-api-client";

const clerkBackendApi = new ClerkBackendApi({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const result = await clerkBackendApi.organizationDomains.list({
    organizationId: "<id>",
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
import { organizationDomainsList } from "@clerk/backend-api-client/funcs/organizationDomainsList.js";

// Use `ClerkBackendApiCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerkBackendApi = new ClerkBackendApiCore({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const res = await organizationDomainsList(clerkBackendApi, {
    organizationId: "<id>",
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
| `request`                                                                                                                                                                      | [operations.ListOrganizationDomainsRequest](../../models/operations/listorganizationdomainsrequest.md)                                                                         | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.OrganizationDomains](../../models/components/organizationdomains.md)\>**

### Errors

| Error Type           | Status Code          | Content Type         |
| -------------------- | -------------------- | -------------------- |
| errors.ClerkErrors   | 401, 422             | application/json     |
| errors.ClerkAPIError | 4XX, 5XX             | \*/\*                |

## update

Updates the properties of an existing organization domain.

### Example Usage

```typescript
import { ClerkBackendApi } from "@clerk/backend-api-client";

const clerkBackendApi = new ClerkBackendApi({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const result = await clerkBackendApi.organizationDomains.update({
    organizationId: "<id>",
    domainId: "<id>",
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
import { ClerkBackendApiCore } from "@clerk/backend-api-client/core.js";
import { organizationDomainsUpdate } from "@clerk/backend-api-client/funcs/organizationDomainsUpdate.js";

// Use `ClerkBackendApiCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerkBackendApi = new ClerkBackendApiCore({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const res = await organizationDomainsUpdate(clerkBackendApi, {
    organizationId: "<id>",
    domainId: "<id>",
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

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.UpdateOrganizationDomainRequest](../../models/operations/updateorganizationdomainrequest.md)                                                                       | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.OrganizationDomain](../../models/components/organizationdomain.md)\>**

### Errors

| Error Type           | Status Code          | Content Type         |
| -------------------- | -------------------- | -------------------- |
| errors.ClerkErrors   | 400, 404, 422        | application/json     |
| errors.ClerkAPIError | 4XX, 5XX             | \*/\*                |

## delete

Removes the given domain from the organization.

### Example Usage

```typescript
import { ClerkBackendApi } from "@clerk/backend-api-client";

const clerkBackendApi = new ClerkBackendApi({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const result = await clerkBackendApi.organizationDomains.delete({
    organizationId: "<id>",
    domainId: "<id>",
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
import { organizationDomainsDelete } from "@clerk/backend-api-client/funcs/organizationDomainsDelete.js";

// Use `ClerkBackendApiCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerkBackendApi = new ClerkBackendApiCore({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const res = await organizationDomainsDelete(clerkBackendApi, {
    organizationId: "<id>",
    domainId: "<id>",
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
| `request`                                                                                                                                                                      | [operations.DeleteOrganizationDomainRequest](../../models/operations/deleteorganizationdomainrequest.md)                                                                       | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.DeletedObject](../../models/components/deletedobject.md)\>**

### Errors

| Error Type           | Status Code          | Content Type         |
| -------------------- | -------------------- | -------------------- |
| errors.ClerkErrors   | 400, 401, 404        | application/json     |
| errors.ClerkAPIError | 4XX, 5XX             | \*/\*                |