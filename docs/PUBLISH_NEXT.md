# Publishing `@next` package versions

_`@next` version updates and publishing is managed using Lerna. The same process applied to any type of preid scheme e.g. `@staging` etc._

Install the `@next` version using `npm install @clerk/{package_name}@next`.

## TLDR

1. To create a @next version scheme, e.g. from `x.y.z` -> `x.y.n-alpha.0`, run `npm run bump:next`
2. To bump a @next version scheme run `npm run bump` (_If you are already in a 'next' scheme e.g. `x.y.z-alpha.0`, you don't need to run `bump:next` again, `bump` will suffice._)
3. To release the next version on NPM run `npm run release:next`

## Graduate the @next version

To graduate\* the version pointed by the `@next` tag:

1. `npm run graduate` . It will graduate the preid version to the stable one e.g. `x.y.n-alpha.0` -> `x.y.n`.
2. `npm run release` . Release the now stable one to NPM as latest.

## Process explanation

The `bump:next` command will create an `alpha` version update on the packages changed. As you are developing and you would like to bump `@next` versions, you would commit your features and then use `bump` to create the proper version increase. At the point you want to release this version on npm to be installed, you would run the `npm run release:next` which would publish the version under the `@next` tag.

\* By 'graduate' we mean publishing the `@next` tagged versions, which in actual versions result in `x.y.z-alpha.a.b.c`, to the stable one `x.y.z`.
