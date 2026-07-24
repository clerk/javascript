---
'@clerk/ui': patch
---

Fix `OrganizationProfileGeneralPanel` (from `@clerk/ui/experimental`) throwing "CardState not found" when opening the leave-organization or delete-organization confirmation in its default, no-children page mode. The panel now provides the same root `CardStateProvider` that a mounted `<OrganizationProfile />` supplies.
