---
'@clerk/shared': patch
---

Relaxing requirements for RQ variant hooks to enable revalidation across different configurations of the same hook.

```tsx

const { revalidate } = useStatements({ initialPage: 1, pageSize: 10 });
useStatements({ initialPage: 1, pageSize: 12 });

// revalidate from first hook, now invalidates the second hook.
void revalidate();
```
