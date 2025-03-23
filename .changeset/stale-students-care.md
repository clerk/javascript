---
"@clerk/nextjs": patch
---

The majority of Clerk applications are not impacted by the NextJS vulnerability disclosed on 22 MAR 2025. Your application might be impacted if you're not using the latest NextJS release and you do not call auth() in your routes or pages. We still recommend upgrading to the latest NextJS version as soon as possible.

For more details, please see https://github.com/advisories/GHSA-f82v-jwr5-mffw
