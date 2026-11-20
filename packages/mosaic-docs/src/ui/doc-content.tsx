import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';

import type { Doc, PropDocs } from '@/core/doc';
import { type DocSection, docSections } from '@/core/doc-sections';

import { CodeBlock } from './code-block';

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
      {docSections(doc).map(section => (
        <Fragment key={section.id}>
          <h2 id={section.id}>{section.title}</h2>
          <SectionBody
            section={section}
            hrefFor={hrefFor}
          />
        </Fragment>
      ))}
    </>
  );
}

function SectionBody({ section, hrefFor }: { section: DocSection; hrefFor: (name: string) => string | undefined }) {
  switch (section.id) {
    case 'use-for':
      return (
        <ul>
          {section.items.map(item => (
            <li key={item}>
              <InlineCode text={item} />
            </li>
          ))}
        </ul>
      );
    case 'practices':
      return (
        <div className='table-scroll'>
          <table>
            <thead>
              <tr>
                <th>Guidance</th>
                <th>Practice</th>
              </tr>
            </thead>
            <tbody>
              {section.practices.map(practice => (
                <tr key={practice.text}>
                  <td>
                    <span
                      className={`${practice.do ? 'bg-positive' : 'bg-negative'} inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium leading-4 text-white`}
                    >
                      {practice.do ? 'Do' : 'Don’t'}
                    </span>
                  </td>
                  <td>
                    <InlineCode text={practice.text} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'api':
      return section.parts.map(part => (
        <section key={part.name}>
          <h3 id={part.slug}>{part.name}</h3>
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
      ));
    case 'options':
    case 'returns':
      return <PropTable props={section.props} />;
    case 'examples':
      return section.examples.map(example => (
        <section key={example.title}>
          <h3>{example.title}</h3>
          <CodeBlock
            code={example.code.trim()}
            lang='tsx'
          />
        </section>
      ));
    case 'related':
      return (
        <ul>
          {section.names.map(name => (
            <li key={name}>
              <RelatedLink
                name={name}
                href={hrefFor(name)}
              />
            </li>
          ))}
        </ul>
      );
  }
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
