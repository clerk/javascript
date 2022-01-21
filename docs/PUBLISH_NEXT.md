# Publishing `@next` package versions

_`@next` version updates and publishing is managed using Lerna._

Install the `@next` version using `npm install @clerk/{package_name}@next`.

## TLDR
1. `npm run bump:next`
2. `npm run release:next`

## Graduate the next version
To graduate\* the version pointed by the `@next` tag:
1. `npm run graduate:next`
2. `npm run release`

## Process explanation
The `bump:next` command will create an `alpha` version update on the packages changed. Next if you want to release this version on npm to be installed, you would run the `npm run release:next` which would publish the version under the `@next` tag.

\* By 'graduate' we mean publishing the `@next` tagged versions, which in actual versions result in `x.y.z-alpha.a.b.c`, to the stable one `x.y.z`.