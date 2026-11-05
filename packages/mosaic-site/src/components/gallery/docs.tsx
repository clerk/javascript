'use client';
import * as React from 'react';

import { EXAMPLES } from '@/components/gallery/examples';
import { type DocBlock, DOCS, type DocSection, type PropRow } from '@/lib/components/docs';
import { cn } from '@/lib/utils';
const copy = 'text-[17px] leading-[1.7] text-neutral-600 dark:text-neutral-400';
const card =
  'border-foreground/10 bg-foreground/[0.02] overflow-hidden rounded-2xl border shadow-[0_1px_1px_#181D1608,0_2px_2px_-1px_#181D1608,0_4px_6px_-3px_#181D160A]';
function Inline({ text }: { text: string }) {
  return text.split('`').map((part, index) =>
    index % 2 === 1 ? (
      <code
        key={`code-${part}`}
        className='bg-foreground/[0.06] rounded-md px-1.5 py-0.5 font-mono text-[0.86em] text-orange-700 dark:text-orange-300'
      >
        {part}
      </code>
    ) : (
      part
    ),
  );
}
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type='button'
      aria-label={copied ? 'Copied' : 'Copy code'}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        });
      }}
      className='hover:text-foreground absolute right-3 top-3 flex size-8 items-center justify-center rounded-lg text-neutral-500 transition-colors'
    >
      {copied ? (
        <svg
          viewBox='0 0 24 24'
          className='size-4'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
        >
          <path d='M20 6 9 17l-5-5' />
        </svg>
      ) : (
        <svg
          viewBox='0 0 24 24'
          className='size-4'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.75'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
        >
          <path d='M9 9h11v11H9zM5 15V5h10' />
        </svg>
      )}
    </button>
  );
}
function CodeBlock({ code }: { code: string }) {
  return (
    <div className={cn(card, 'relative mt-5')}>
      <pre className='text-foreground overflow-x-auto p-5 pr-14 font-mono text-[14px] leading-[1.7]'>{code}</pre>
      <CopyButton text={code} />
    </div>
  );
}
type TableRow = { key: string; cells: { key: string; node: React.ReactNode }[] };
function Table({ head, rows }: { head: string[]; rows: TableRow[] }) {
  return (
    <div className={cn(card, 'mt-5')}>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[520px] border-collapse text-left text-[15px]'>
          <thead>
            <tr className='border-foreground/10 border-b'>
              {head.map(label => (
                <th
                  key={label}
                  className='px-5 py-3.5 font-normal text-neutral-500'
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ key, cells }) => (
              <tr
                key={key}
                className='border-foreground/10 border-b align-top last:border-b-0'
              >
                {cells.map(({ key: cellKey, node }) => (
                  <td
                    key={cellKey}
                    className='px-5 py-3.5 leading-6 text-neutral-600 dark:text-neutral-400'
                  >
                    {node}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <Table
      head={['Prop', 'Type', 'Default']}
      rows={rows.map(row => ({
        key: row.name,
        cells: [
          {
            key: 'name',
            node: (
              <div className='flex flex-col items-start gap-1.5'>
                <Inline text={`\`${row.name}\``} />
                {row.description ? (
                  <span className='text-[14px] leading-5'>
                    <Inline text={row.description} />
                  </span>
                ) : null}
              </div>
            ),
          },
          {
            key: 'type',
            node: <span className='font-mono text-[13px] leading-5'>{row.type}</span>,
          },
          {
            key: 'default',
            node: row.default ? <Inline text={`\`${row.default}\``} /> : <span className='text-neutral-400'>-</span>,
          },
        ],
      }))}
    />
  );
}
function Example({ slug, id }: { slug: string; id: string }) {
  const Live = EXAMPLES[slug]?.[id];
  if (!Live) {
    return null;
  }
  return (
    <div className='border-foreground/10 mt-5 flex min-h-[180px] items-center justify-center overflow-x-auto rounded-2xl border bg-[var(--cl-color-page,#fff)] p-8 shadow-[0_1px_1px_#181D1608,0_2px_2px_-1px_#181D1608,0_4px_6px_-3px_#181D160A]'>
      <Live />
    </div>
  );
}
function Block({ slug, block }: { slug: string; block: DocBlock }) {
  switch (block.type) {
    case 'p':
      return (
        <p className={cn(copy, 'mt-5')}>
          <Inline text={block.text} />
        </p>
      );
    case 'list':
      return (
        <ul className='mt-5 flex flex-col gap-3'>
          {block.items.map(item => (
            <li
              key={item}
              className={cn(copy, 'relative pl-7')}
            >
              <span className='absolute left-1.5 top-[0.8em] size-1.5 rounded-full bg-neutral-400/60' />
              <Inline text={item} />
            </li>
          ))}
        </ul>
      );
    case 'code':
      return <CodeBlock code={block.code} />;
    case 'props':
      return <PropsTable rows={block.rows} />;
    case 'table':
      return (
        <Table
          head={block.head}
          rows={block.rows.map(cells => ({
            key: cells[0],
            cells: cells.map((cell, column) => ({
              key: `${cells[0]}:${column}`,
              node: (
                <span className={column === 0 ? 'text-foreground' : undefined}>
                  <Inline text={cell} />
                </span>
              ),
            })),
          }))}
        />
      );
    case 'example':
      return (
        <Example
          slug={slug}
          id={block.id}
        />
      );
  }
}
function Section({ slug, section }: { slug: string; section: DocSection }) {
  const level = section.level ?? 2;
  return (
    <section className={level === 2 ? 'mt-16' : 'mt-12'}>
      {level === 2 ? (
        <h2
          className='text-[34px] font-medium leading-[1.1] tracking-[-0.03em]'
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {section.title}
        </h2>
      ) : (
        <h3
          className='text-[24px] font-medium leading-[1.2] tracking-[-0.02em]'
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {section.title}
        </h3>
      )}
      {section.blocks.map((block, index) => (
        <Block
          key={`${block.type}-${index}`}
          slug={slug}
          block={block}
        />
      ))}
    </section>
  );
}
export function ComponentDocs({ slug, fallback }: { slug: string; fallback: string }) {
  const sections = DOCS[slug];
  if (!sections) {
    return <CodeBlock code={fallback} />;
  }
  const visible = sections.reduce<{ skipping: boolean; items: DocSection[] }>(
    (state, section) => {
      const level = section.level ?? 2;
      if (level === 2) {
        state.skipping = section.title === 'Examples';
      }
      if (!state.skipping) {
        state.items.push({ ...section, blocks: section.blocks.filter(block => block.type !== 'example') });
      }
      return state;
    },
    { skipping: false, items: [] },
  ).items;
  return (
    <div className='-mt-4 w-full max-w-[780px] pb-24 text-left'>
      {visible.map(section => (
        <Section
          key={section.title}
          slug={slug}
          section={section}
        />
      ))}
    </div>
  );
}
