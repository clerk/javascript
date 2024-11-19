<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_expo" target="_blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./public/clerk-logo-dark.png">
      <img src="./public/clerk-logo-light.png" height="64">
    </picture>
  </a>
  <br />
</p>

# Clerk Chrome Extension Starter

This starter project shows how to use [Clerk](https://www.clerk.dev/?utm_source=github&utm_medium=starter_repos&utm_campaign=chrome_extension_start) authentication in a React based [Chrome Extension](https://developer.chrome.com/docs/extensions/).

[![chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.com/invite/b5rXHjAg7A)
[![documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://docs.clerk.dev)
[![twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

If you run into issues, be sure to check our [main npm page](https://www.npmjs.com/package/@clerk/chrome-extension) for any updated settings/steps you may need to be aware of.

---

**Clerk is Hiring!**

Would you like to work on Open Source software and help maintain this repository? [Apply today!](https://apply.workable.com/clerk-dev/)

---

## Introduction

This project was bootstrapped with [Vite](https://vitejs.dev/) with [CRXJ](https://crxjs.dev/vite-plugin/).

It's a kitchen-sink starter of how to use ClerkJS in a Chrome Extension either as a Standalone App or alongside a Web Application via WebSSO.

<img src="./demo.png" height="400">

It demonstrates a basic password or OTP flow using ClerkJS Components in the following extension contexts:

- [x] Popup `action.*`
- [x] Chrome Pages
  - [x] New Tab `chrome_url_overrides.newtab`
  - [x] History `chrome_url_overrides.history`
  - [x] Bookmark Manager `chrome_url_overrides.bookmarks`
- [x] Dev Tools `devtools_page`
- [x] Extension Options `options_ui`

You may safely remove any of the above contexts from the `manifest.json` if you do not need them.

This repo will be enhanced with examples of authentication redirection flows such as OAuth or Magic Links and advanced extension patterns.

## Getting Started

1. Sign up for a Clerk account at [https://clerk.com](https://dashboard.clerk.com/sign-up?utm_source=github&utm_medium=template_repos&utm_campaign=chrome_extension_template).
2. Go to the [Clerk dashboard](https://dashboard.clerk.com?utm_source=github&utm_medium=template_repos&utm_campaign=chrome_extension_template) and create an application.
3. Clone the repository `git clone https://github.com/clerkinc/clerk-chrome-extension-starter.git clerk-chrome-extension-starter`
4. Go to the project directory: cd clerk-chrome-extension-starter
5. Install dependencies: `npm install`
6. Copy example files and sent the required variables in each file:
   - `cp .env.example .env`
   - `cp manifest.json.example manifest.json`
   - `cp manifest.dev.json.example manifest.dev.json` (The attributes in this file overwrite the attributes in `manifest.json` when running in development mode.)
7. Launch the development server: `pnpm dev`

The files generated in the `dist` directory can be loaded as an unpacked extension in Chrome.

PLEASE NOTE: Any changes to the manifest require a reload of the extension in [chrome://extensions/](chrome://extensions/).
