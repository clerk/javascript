---
'@clerk/astro': major
---

Changed environment variable resolution order in `getContextEnvVar()` to prefer `process.env` over `import.meta.env`. Runtime environment variables (e.g., set in the Node.js adapter) now take precedence over build-time values statically replaced by Vite. This ensures that environment variables set at runtime behave as expected when deploying with the Astro Node adapter or similar runtime environments.
