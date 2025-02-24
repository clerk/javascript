---
'@clerk/tanstack-start': minor
'@clerk/react-router': minor
'@clerk/backend': minor
'@clerk/nextjs': minor
'@clerk/astro': minor
'@clerk/remix': minor
'@clerk/express': minor
'@clerk/fastify': minor
'@clerk/nuxt': minor
---

Introduces `WebhookEventPayload<TWebhookEventType>`, a utility type that allows to infer webhook payloads based on event types. 

Usage: 
```ts
type UserCreatedPayload = WebhookEventPayload<"user.created">;
//   ^? { 
//          object: "event";
//          data: UserJSON;
//          type: "user.created";
//      }
```
