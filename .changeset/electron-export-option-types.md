---
'@clerk/electron': patch
---

Export the `StorageOptions`, `RendererSchemeOptions`, and `SetupPasskeysMainReturn` types so consumers can type their configuration without reaching through `CreateClerkBridgeOptions['renderer']`.
