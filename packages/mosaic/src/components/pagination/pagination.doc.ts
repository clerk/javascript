import type { ComponentDoc } from '../../docs-schema';
import type { PaginationProps } from './pagination';

export default {
  name: 'Pagination',
  description:
    'Page controls for a paged list: the item range, an optional results-per-page select, first, previous, next and last buttons, and the page over the total. Pages start at 1.',
  useFor: ['moving between pages of a table or list', 'choosing how many results show per page'],
  keywords: ['pagination', 'pager', 'pages', 'next page', 'previous page', 'page size', 'results per page'],
  practices: [
    {
      do: true,
      text: 'Pass localized strings for every label. The defaults are English.',
    },
    { do: true, text: 'Pass `onPageSizeChange` to show the results-per-page select. It is hidden without one.' },
    { do: false, text: 'Clamp the page yourself. `onChange` gets a page between 1 and the last page.' },
  ],
  parts: {
    Pagination: {
      description: 'A `nav` labelled by `label`. Out-of-range `page` values render as the nearest valid page.',
      slot: 'cl-pagination',
      props: {
        page: { type: 'number', doc: 'The current page.' },
        totalItems: { type: 'number', doc: 'The item count across all pages.' },
        pageSize: { type: 'number', doc: 'Items per page.' },
        onChange: { type: '(page: number) => void', doc: 'Called with the page the user asked for.' },
        pageSizeOptions: {
          type: 'number[]',
          doc: 'Choices in the results-per-page select. The current `pageSize` is always added.',
          default: '[10, 15, 20, 100]',
        },
        onPageSizeChange: {
          type: '(pageSize: number) => void',
          doc: 'Called with the new page size. Shows the select when set.',
        },
        hasFirstLast: { type: 'boolean', doc: 'Shows the first and last page buttons.', default: 'true' },
        step: { type: 'number', doc: 'Pages moved by previous and next.', default: '1' },
        disabled: { type: 'boolean', doc: 'Disables every control.', default: 'false' },
        label: { type: 'string', doc: 'The `nav` accessible name.', default: "'Pagination'" },
        rangeLabel: {
          type: 'string',
          doc: 'The range text, with `{start}`, `{end}` and `{total}` filled in.',
          default: "'{start}–{end} of {total}'",
        },
        pageSizeLabel: { type: 'string', doc: 'The select label and accessible name.', default: "'Results per page'" },
        pageSizeLabelCompact: {
          type: 'string',
          doc: 'The select label when the pagination is narrow.',
          default: "'Show'",
        },
        firstPageLabel: { type: 'string', doc: 'The first page button name.', default: "'First page'" },
        previousPageLabel: { type: 'string', doc: 'The previous page button name.', default: "'Previous page'" },
        nextPageLabel: { type: 'string', doc: 'The next page button name.', default: "'Next page'" },
        lastPageLabel: { type: 'string', doc: 'The last page button name.', default: "'Last page'" },
      },
    },
  },
  examples: [
    {
      title: 'A pager',
      code: `
<Pagination page={page} totalItems={120} pageSize={10} onChange={setPage} />
`,
    },
  ],
  related: ['Select'],
} satisfies ComponentDoc<{ Pagination: PaginationProps }>;
