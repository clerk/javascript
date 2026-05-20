---
'@clerk/localizations': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Introduce UX improvements for `<ConfigureSSO />` such as:

- Show the user's primary email domain in the sidebar footer for at-a-glance context
- Render attribute-mapping and service-provider field labels per IdP nomenclature
- Add "Open test URL" button and surface a clear empty state
- Expand the appearance descriptor surface across step content so developers can override styling
