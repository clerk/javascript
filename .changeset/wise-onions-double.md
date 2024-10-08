---
"@clerk/fastify": major
---

Recently Fastify released its v5 and along with it came some breaking changes. Read their [migration guide](https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/) to learn more.

In order to support Fastify v5 a new major version of `@clerk/fastify` is required as Fastify's Node.js requirement is now `>=20`. Previously `@clerk/fastify` allowed `>=18.17.0`.

`@clerk/fastify@2.0.0` only supports Fastify v5 or later, if you want/need to continue using Fastify v4, please stick with your current version. The `@clerk/fastify@2.0.0` upgrade itself doesn't have any required code changes as only internal dependencies and requirements were updated.
