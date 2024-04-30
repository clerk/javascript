---
'@clerk/shared': patch
---

The following are all internal changes and not relevant to any end-user:

- Rename the existing `eventComponentMounted` function inside `/telemetry` to `eventPrebuiltComponentMounted`. This better reflects that its `props` argument will be filtered for a relevant list for Clerk's prebuilt/all-in-one components.
- Reuse the now freed up `eventComponentMounted` name to create a new helper function that accepts a flat object for its `props` but doesn't filter any. This is useful for components that are not prebuilt.
