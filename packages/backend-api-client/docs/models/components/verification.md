# Verification


## Supported Types

### `components.Otp`

```typescript
const value: components.Otp = {
  status: "expired",
  strategy: "phone_code",
  attempts: 868126,
  expireAt: 162493,
};
```

### `components.Admin`

```typescript
const value: components.Admin = {
  status: "verified",
  strategy: "admin",
  attempts: 615560,
  expireAt: 123820,
};
```

### `components.FromOAuth`

```typescript
const value: components.FromOAuth = {
  status: "verified",
  strategy: "<value>",
  expireAt: 807319,
  attempts: 569101,
};
```

### `components.Ticket`

```typescript
const value: components.Ticket = {
  status: "verified",
  strategy: "ticket",
  attempts: 69167,
  expireAt: 697429,
};
```

