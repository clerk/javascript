---
'@clerk/clerk-js': patch
'@clerk/types': patch
---

Add support for the new `enterprise_sso` strategy.

This strategy supersedes SAML to provide a single strategy as the entry point for Enterprise Single Sign On regardless of the underlying protocol used to authenticate the user. 
For now there are two new types of connections that are supported in addition to SAML, Custom OAuth and EASIE (multi-tenant OAuth).
