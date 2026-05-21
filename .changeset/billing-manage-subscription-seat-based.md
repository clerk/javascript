---
"@clerk/ui": patch
---

Fix the Manage Subscription button in `<UserProfile />` / `<OrganizationProfile />` and the Cancel / Re-subscribe actions in `<SubscriptionDetails />` so they are shown for paid seat-based plans that have no base fee. A shared `isManageableSubscriptionItem` helper now drives both places, treating "free / unmanageable" as "the instance's default plan" instead of "the plan has no base fee".
