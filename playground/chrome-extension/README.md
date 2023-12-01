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

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). It demonstrates a basic password or OTP flow using ClerkJS Components in a Chrome Extension Popup.

<img src="./demo.png" height="400">

This repo will be enhanced with examples of authentication redirection flows such as OAuth or Magic Links and advance extension patterns
using [Manifest V3 service workers](https://developer.chrome.com/docs/extensions/mv3/service_workers/) and the new [chrome.storage API](https://developer.chrome.com/docs/extensions/reference/storage/).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
