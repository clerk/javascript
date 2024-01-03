# @clerk/upgrade

A tool that helps with upgrading major versions of Clerk's SDKs.

## Usage

```bash
$ npx @clerk/upgrade
```

## Caveats

This tool uses regular expressions to scan for patterns that match breaking changes. This makes it run substantially faster and makes it more accessible for us at Clerk to author matchers for each breaking change, however it means that _we cannot gurarantee 100% accuracy of the results_. As such, it's important to treat this as a tool that can help you to complete your major version upgrades, rather than an automatic fix to all issues.

The main thing that this tool will miss is cases where _unusual import patterns_ are used in your codebase.As an example, if we made a breaking change to the `getAuth` function exported from `@clerk/nextjs`, we would likely look for something like `import { getAuth } from "@clerk/nextjs"` in order to detect whether you need to make some changes. If you were running your imports like `import * as ClerkNext from "@clerk/nextjs"`, you could use `getAuth` without us detecting it with our matcher.

It will also be very likely to miss if you bind a method on an object to a separate variable and call it from there, or pass a bound method through a function param. For example, something like this:

```js
const updateUser = user.update.bind(user);

updateUser({ username: 'foo' });
```

Overall, there's a very good chance that this tool catches everything, but it's not a guarantee, so make sure that you also test your app before deploying, and that you have good e2e test coverage, which are good practices normally anyway, rather than blindly trusting that since the clerk upgrade tool was run, you are for sure covered.
