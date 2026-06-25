---
'@clerk/ui': patch
---

Fix the self-serve SSO configuration wizard losing your place when organization data refetches mid-flow. After submitting a Configure step (for example saving an identity provider's metadata), a background refetch on the OrganizationProfile Security page could unmount the open ConfigureSSO wizard and re-render it on an earlier step. The wizard now stays on its current step while data loads in the background.
