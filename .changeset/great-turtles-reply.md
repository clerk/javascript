---
'@clerk/clerk-js': minor
---

Throw an error in development when there is an invalid mount or modal open. This includes mounting a component when the resource is not available (i.e. `mountUserProfile()` when the user does not exist) as well as mounting a component without the feature being enabled via the clerk dashboard (i.e. `mountOrganizationProfile()` without having organizations enabled).
