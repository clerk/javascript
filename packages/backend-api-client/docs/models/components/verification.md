# Verification


## Supported Types

### `components.Otp`

```typescript
const value: components.Otp = {
  status: "verified",
  strategy: "email_code",
  attempts: 96573,
  expireAt: 203129,
};
```

### `components.Admin`

```typescript
const value: components.Admin = {
  status: "verified",
  strategy: "admin",
  attempts: 443786,
  expireAt: 762106,
};
```

### `components.FromOAuth`

```typescript
const value: components.FromOAuth = {
  status: "unverified",
  strategy: "<value>",
  expireAt: 680983,
  attempts: 822603,
};
```

### `components.Ticket`

```typescript
const value: components.Ticket = {
  status: "unverified",
  strategy: "ticket",
  attempts: 281284,
  expireAt: 751089,
};
```

