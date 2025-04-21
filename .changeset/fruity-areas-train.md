---
'@clerk/testing': minor
---

Switching over our interception of FAPI calls from page.route to context.route as routes set up with page.route() take precedence over browser context routes when request matches both handlers.

This allows for users to override calls to FAPI more consistently
