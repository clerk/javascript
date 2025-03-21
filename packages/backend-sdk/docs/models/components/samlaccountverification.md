# SAMLAccountVerification

## Supported Types

### `components.Saml`

```typescript
const value: components.Saml = {
  status: 'verified',
  strategy: 'saml',
  externalVerificationRedirectUrl: 'https://dependent-valentine.net',
  expireAt: 215507,
  attempts: 947371,
};
```

### `components.VerificationTicket`

```typescript
const value: components.VerificationTicket = {
  status: 'expired',
  strategy: 'ticket',
  attempts: 253941,
  expireAt: 213312,
};
```
