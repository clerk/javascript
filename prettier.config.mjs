export default {
  arrowParens: 'avoid',
  bracketSpacing: true,
  jsxSingleQuote: true,
  plugins: ['prettier-plugin-packagejson', 'prettier-plugin-tailwindcss', 'prettier-plugin-astro'],
  printWidth: 120,
  semi: true,
  singleAttributePerLine: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  overrides: [
    {
      // Leave fenced code samples in MDX docs exactly as authored. Without this,
      // `semi: true` reformats the embedded code and re-adds trailing semicolons to
      // JSX usage examples (e.g. `</Collapsible.Root>;`). Markdown prose and tables
      // are still formatted as normal.
      files: '*.mdx',
      options: { embeddedLanguageFormatting: 'off' },
    },
  ],
};
