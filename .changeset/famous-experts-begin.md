---
'@clerk/types': patch
---

Add support for the new `enterprise_sso` strategy.

This strategy supersedes SAML to provide a single strategy as the entry point for Enterprise Single Sign On regardless of the underlying protocol used to authenticate the user. 
For now there are two new types of connections that are supported in addition to SAML, Custom OAuth and EASIE (multi-tenant OAuth).

- Add a new user setting `enterpriseSSO`, this gets enabled when there is an active enterprise connection for an instance.
- Add support for signing in / signing up with the new `enterprise_sso` strategy.
- Deprecated `userSettings.saml` in favor of `enterprise_sso`.
- Deprecated `saml` sign in strategy in favor of `enterprise_sso`.
