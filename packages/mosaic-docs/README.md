# Mosaic docs

The documentation site for [`@clerk/mosaic`](../mosaic), Clerk's component library.

## Development

From the repository root:

```sh
pnpm dev:mosaic-docs
```

This builds `@clerk/mosaic` and starts the site at http://localhost:6021.

## Layout

The site is split into layers so the docs system can be reused. `src/layers.test.ts` enforces the import rules.

| Folder          | Contains                                                                                                                                | May import    |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `src/core`      | Pure functions and the doc schema: Markdown output, llms.txt, content negotiation, highlighting, the TOC and the remark headings plugin | packages only |
| `src/ui`        | React parts and `styles.css`                                                                                                            | `src/core`    |
| `src/next`      | Next.js adapters, such as `markdownProxy`                                                                                               | `src/core`    |
| everything else | Mosaic-specific content, data, examples and pages                                                                                       | anything      |

## Acknowledgements

The site's design and features were inspired by [Blume](https://github.com/haydenbleasel/blume) and [Fumadocs](https://github.com/fuma-nama/fumadocs).
