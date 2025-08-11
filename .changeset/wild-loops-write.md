---
'@clerk/types': patch
---

feat(types): add legalAcceptedAt to UserResource
- Add legalAcceptedAt: Date | null to UserResource in packages/types/src/user.ts
- Aligns with existing User implementation and UserJSON (legal_accepted_at)
- Non-breaking addition for improved type completeness
