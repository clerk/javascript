# ExperimentalAccountlessApplications
(*experimentalAccountlessApplications*)

## Overview

### Available Operations

* [create](#create) - Create an accountless application [EXPERIMENTAL]
* [complete](#complete) - Complete an accountless application [EXPERIMENTAL]

## create

Creates a new accountless application. [EXPERIMENTAL]

### Example Usage

```typescript
import { Clerk } from "@clerk/backend-api-client";

const clerk = new Clerk({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const result = await clerk.experimentalAccountlessApplications.create();

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkCore } from "@clerk/backend-api-client/core.js";
import { experimentalAccountlessApplicationsCreate } from "@clerk/backend-api-client/funcs/experimentalAccountlessApplicationsCreate.js";

// Use `ClerkCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerk = new ClerkCore({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const res = await experimentalAccountlessApplicationsCreate(clerk);

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
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.AccountlessApplication](../../models/components/accountlessapplication.md)\>**

### Errors

| Error Type         | Status Code        | Content Type       |
| ------------------ | ------------------ | ------------------ |
| errors.ClerkErrors | 500                | application/json   |
| errors.APIError    | 4XX, 5XX           | \*/\*              |

## complete

Completes an accountless application. [EXPERIMENTAL]

### Example Usage

```typescript
import { Clerk } from "@clerk/backend-api-client";

const clerk = new Clerk({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const result = await clerk.experimentalAccountlessApplications.complete();

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ClerkCore } from "@clerk/backend-api-client/core.js";
import { experimentalAccountlessApplicationsComplete } from "@clerk/backend-api-client/funcs/experimentalAccountlessApplicationsComplete.js";

// Use `ClerkCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const clerk = new ClerkCore({
  bearerAuth: process.env["CLERK_BEARER_AUTH"] ?? "",
});

async function run() {
  const res = await experimentalAccountlessApplicationsComplete(clerk);

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
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.AccountlessApplication](../../models/components/accountlessapplication.md)\>**

### Errors

| Error Type         | Status Code        | Content Type       |
| ------------------ | ------------------ | ------------------ |
| errors.ClerkErrors | 500                | application/json   |
| errors.APIError    | 4XX, 5XX           | \*/\*              |