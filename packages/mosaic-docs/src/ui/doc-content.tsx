import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';

import type { Doc, PropDocs } from '@/core/doc';
import type { DocTabs, OverviewSection } from '@/core/doc-sections';
import { playgroundContent, playgroundValues } from '@/core/playground';

import { CodeBlock } from './code-block';
import { PlaygroundControl, PlaygroundProvider } from './playground';

export function DocContent({
  doc,
  sections,
  intro,
  hrefFor,
}: {
  doc: Doc;
  sections: OverviewSection[];
  intro?: ReactNode;
  hrefFor: (name: string) => string | undefined;
}) {
  return (
    <>
      <DocTitle doc={doc} />
      {intro}
      {sections.map(section => (
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

export function DocProperties({
  doc,
  intro,
  tabs,
  preview,
}: {
  doc: Doc;
  intro: ReactNode;
  tabs: DocTabs;
  preview: ReactNode;
}) {
  const props = tabs.part.props ?? {};
  return (
    <>
      <DocTitle doc={doc} />
      {intro}
      <div id={tabs.part.slug}>
        <PlaygroundProvider
          name={tabs.part.name}
          props={props}
          initial={playgroundValues(props, tabs.defaults)}
          content={playgroundContent(tabs.defaults)}
        >
          {preview}
          <PropTable
            props={props}
            controlled
          />
        </PlaygroundProvider>
      </div>
    </>
  );
}

function DocTitle({ doc }: { doc: Doc }) {
  return (
    <>
      <h1>{doc.name}</h1>
      <p className='lead'>
        <InlineCode text={doc.description} />
      </p>
    </>
  );
}

function SectionBody({
  section,
  hrefFor,
}: {
  section: OverviewSection;
  hrefFor: (name: string) => string | undefined;
}) {
  switch (section.id) {
    case 'usage':
      return (
        <ul>
          {section.items.map(item => (
            <li key={item}>
              <InlineCode text={item} />
            </li>
          ))}
        </ul>
      );
    case 'parts':
      return (
        <div className='table-scroll'>
          <table>
            <thead>
              <tr>
                <th>Part</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {section.parts.map(part => (
                <tr
                  key={part.name}
                  id={part.slug}
                >
                  <td>
                    <code>{part.name}</code>
                  </td>
                  <td>
                    <InlineCode text={part.description} />
                    {part.slot ? (
                      <span className='text-muted-foreground mt-1 block'>
                        Slot: <code>{part.slot}</code>
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'best-practices':
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
    case 'options':
    case 'returns':
      return <PropTable props={section.props} />;
    case 'examples':
      return (
        <>
          {section.examples.map(example => (
            <section key={example.title}>
              <h3>{example.title}</h3>
              <CodeBlock
                code={example.code.trim()}
                lang='tsx'
              />
            </section>
          ))}
        </>
      );
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

function PropTable({ props, controlled = false }: { props: PropDocs; controlled?: boolean }) {
  const rows = Object.entries(props).flatMap(([name, prop]) => (prop ? [{ name, ...prop }] : []));
  return (
    <div className='table-scroll'>
      <table>
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Description</th>
            {controlled ? <th>Value</th> : null}
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
              {controlled ? (
                <td>
                  <PlaygroundControl
                    prop={row.name}
                    type={row.type}
                  />
                </td>
              ) : null}
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
