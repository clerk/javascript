import Link from 'next/link';
import type { ReactNode } from 'react';

import type { Doc, PropDocs } from '@/core/doc';
import type { TocHeading } from '@/core/toc';

import { CodeBlock } from './code-block';

export function docHeadings(doc: Doc): TocHeading[] {
  const headings: TocHeading[] = [{ depth: 2, slug: 'use-for', text: 'Use for' }];
  if (doc.practices?.length) {
    headings.push({ depth: 2, slug: 'practices', text: 'Practices' });
  }
  if ('parts' in doc) {
    headings.push({ depth: 2, slug: 'api', text: 'API reference' });
    for (const name of Object.keys(doc.parts)) {
      headings.push({ depth: 3, slug: partSlug(name), text: name });
    }
  } else {
    if (doc.options && Object.keys(doc.options).length > 0) {
      headings.push({ depth: 2, slug: 'options', text: 'Options' });
    }
    if (Object.keys(doc.returns).length > 0) {
      headings.push({ depth: 2, slug: 'returns', text: 'Returns' });
    }
  }
  if (doc.examples?.length) {
    headings.push({ depth: 2, slug: 'examples', text: 'Examples' });
  }
  if (doc.related?.length) {
    headings.push({ depth: 2, slug: 'related', text: 'Related' });
  }
  return headings;
}

export function DocContent({
  doc,
  preview,
  hrefFor,
}: {
  doc: Doc;
  preview?: ReactNode;
  hrefFor: (name: string) => string | undefined;
}) {
  return (
    <>
      <h1>{doc.name}</h1>
      <p className='lead'>
        <InlineCode text={doc.description} />
      </p>
      {preview}

      <h2 id='use-for'>Use for</h2>
      <ul>
        {doc.useFor.map(item => (
          <li key={item}>
            <InlineCode text={item} />
          </li>
        ))}
      </ul>

      {doc.practices?.length ? (
        <>
          <h2 id='practices'>Practices</h2>
          <ul>
            {doc.practices.map(practice => (
              <li key={practice.text}>
                <strong>{practice.do ? 'Do' : 'Don’t'}:</strong> <InlineCode text={practice.text} />
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {'parts' in doc ? (
        <>
          <h2 id='api'>API reference</h2>
          {Object.entries(doc.parts).map(([name, part]) => (
            <section key={name}>
              <h3 id={partSlug(name)}>{name}</h3>
              <p>
                <InlineCode text={part.description} />
              </p>
              {part.slot ? (
                <p className='text-muted-foreground text-sm'>
                  Slot: <code>{part.slot}</code>
                </p>
              ) : null}
              {part.props ? <PropTable props={part.props} /> : null}
            </section>
          ))}
        </>
      ) : (
        <>
          {doc.options && Object.keys(doc.options).length > 0 ? (
            <>
              <h2 id='options'>Options</h2>
              <PropTable props={doc.options} />
            </>
          ) : null}
          {Object.keys(doc.returns).length > 0 ? (
            <>
              <h2 id='returns'>Returns</h2>
              <PropTable props={doc.returns} />
            </>
          ) : null}
        </>
      )}

      {doc.examples?.length ? (
        <>
          <h2 id='examples'>Examples</h2>
          {doc.examples.map(example => (
            <section key={example.title}>
              <h3>{example.title}</h3>
              <CodeBlock
                code={example.code.trim()}
                lang='tsx'
              />
            </section>
          ))}
        </>
      ) : null}

      {doc.related?.length ? (
        <>
          <h2 id='related'>Related</h2>
          <ul>
            {doc.related.map(name => (
              <li key={name}>
                <RelatedLink
                  name={name}
                  href={hrefFor(name)}
                />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}

function PropTable({ props }: { props: PropDocs }) {
  const rows = Object.entries(props).flatMap(([name, prop]) => (prop ? [{ name, ...prop }] : []));
  return (
    <div className='table-scroll'>
      <table>
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>
                <code>{row.type}</code>
              </td>
              <td>
                <InlineCode text={row.doc} />
                {row.default ? (
                  <span className='text-muted-foreground mt-1 block'>
                    Default: <code>{row.default}</code>
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RelatedLink({ name, href }: { name: string; href: string | undefined }) {
  return href ? <Link href={href}>{name}</Link> : <code>{name}</code>;
}

function InlineCode({ text }: { text: string }) {
  let offset = 0;
  return text.split('`').map((segment, index) => {
    const key = offset;
    offset += segment.length + 1;
    return index % 2 === 1 ? <code key={key}>{segment}</code> : segment;
  });
}

function partSlug(name: string): string {
  return `part-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}
