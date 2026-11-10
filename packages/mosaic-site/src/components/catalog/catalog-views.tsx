'use client';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { inertProps } from '@clerk/shared/inert';
import Link from 'next/link';

import { StoryGallery } from '@/components/catalog/story-gallery';
import { DEMOS } from '@/components/gallery/demos';
import { ScaledFrame } from '@/components/gallery/scaled-frame';
import {
  CATALOG,
  type CatalogCategory,
  type CatalogItem,
  getCategory,
  getItem,
  type Kind,
  KINDS,
} from '@/lib/components/catalog';
import { getComponentMeta } from '@/lib/components/meta';
import { storyFileFor } from '@/lib/components/stories';

const kindInfo = (kind: Kind) => KINDS.find(item => item.id === kind) ?? KINDS[0];

function Crumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav
      aria-label='Breadcrumb'
      className='flex items-center gap-2 text-sm text-neutral-500'
    >
      {trail.map((crumb, index) => (
        <span
          key={crumb.label}
          className='flex items-center gap-2'
        >
          {index > 0 ? <span aria-hidden='true'>/</span> : null}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className='hover:text-foreground transition-colors'
            >
              {crumb.label}
            </Link>
          ) : (
            <span className='text-foreground'>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function SoonBadge() {
  return (
    <span className='bg-foreground/[0.06] rounded-full px-2.5 py-1 text-[12px] font-medium text-neutral-500'>
      Coming soon
    </span>
  );
}

function Thumb({ kind, item }: { kind: Kind; item: CatalogItem }) {
  const meta = kind === 'blocks' ? getComponentMeta(item.slug) : undefined;
  const Demo = kind === 'blocks' ? DEMOS[item.slug] : undefined;
  if (meta && Demo && !item.soon) {
    return (
      <MosaicProvider>
        <ScaledFrame
          width={meta.thumbWidth}
          center={meta.center}
          className='aspect-[16/10] w-full bg-[var(--cl-color-page,#fff)]'
        >
          <Demo />
        </ScaledFrame>
      </MosaicProvider>
    );
  }
  return (
    <div className='bg-foreground/[0.03] flex aspect-[16/10] w-full items-center justify-center'>
      <SoonBadge />
    </div>
  );
}

function Card({ kind, item }: { kind: Kind; item: CatalogItem }) {
  const description = (kind === 'blocks' ? getComponentMeta(item.slug)?.description : undefined) ?? item.description;
  return (
    <div className='group relative flex flex-col gap-3'>
      <div
        {...inertProps(true)}
        aria-hidden='true'
        className='ring-foreground/10 group-hover:ring-foreground/25 pointer-events-none overflow-hidden rounded-2xl ring-1 transition-shadow'
      >
        <Thumb
          kind={kind}
          item={item}
        />
      </div>
      <div className='flex flex-col gap-0.5 px-1'>
        <Link
          href={`/${kind}/${item.slug}`}
          className='text-foreground text-sm font-medium after:absolute after:inset-0'
        >
          {item.title}
        </Link>
        {description ? <span className='line-clamp-2 text-[13px] text-neutral-500'>{description}</span> : null}
      </div>
    </div>
  );
}

function CategorySection({
  kind,
  category,
  linked,
  showHeading,
}: {
  kind: Kind;
  category: CatalogCategory;
  linked: boolean;
  showHeading: boolean;
}) {
  return (
    <section
      aria-labelledby={showHeading ? `category-${category.id}` : undefined}
      className='mt-14 first:mt-10'
    >
      {showHeading ? (
        <h2
          id={`category-${category.id}`}
          className='text-foreground text-xl font-semibold tracking-tight'
        >
          {linked ? (
            <Link
              href={`/${kind}/category/${category.id}`}
              className='hover:text-neutral-500'
            >
              {category.label}
            </Link>
          ) : (
            category.label
          )}
        </h2>
      ) : null}
      {category.groups.map(group => (
        <div
          key={group.label || category.id}
          className='mt-5'
        >
          {group.label ? <h3 className='mb-3 text-[13px] font-medium text-neutral-500'>{group.label}</h3> : null}
          <div className='grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3'>
            {group.items.map(item => (
              <Card
                key={item.slug}
                kind={kind}
                item={item}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export function CatalogGrid({ kind, categoryId }: { kind: Kind; categoryId?: string }) {
  const info = kindInfo(kind);
  const category = categoryId ? getCategory(kind, categoryId) : undefined;
  const categories = category ? [category] : CATALOG[kind];
  return (
    <main className='mx-auto w-full max-w-[1100px] px-6 pb-24 pt-14 md:px-10'>
      <Crumbs
        trail={
          category ? [{ label: info.label, href: `/${kind}` }, { label: category.label }] : [{ label: info.label }]
        }
      />
      <h1 className='text-foreground mt-4 text-4xl font-bold tracking-tight'>{category?.label ?? info.label}</h1>
      <p className='mt-3 max-w-xl text-base text-neutral-500'>{info.blurb}</p>
      {categories.map(item => (
        <CategorySection
          key={item.id}
          kind={kind}
          category={item}
          linked={!category}
          showHeading={!category && categories.length > 1}
        />
      ))}
    </main>
  );
}

export function CatalogItemPage({ kind, slug }: { kind: Kind; slug: string }) {
  const info = kindInfo(kind);
  const item = getItem(kind, slug);
  const entries = CATALOG[kind].flatMap(entry => entry.groups.flatMap(group => group.items.map(i => ({ entry, i }))));
  const top = entries.find(found => found.i.slug === slug);
  const owner = top ? undefined : entries.find(found => found.i.children?.some(child => child.slug === slug));
  const category = (top ?? owner)?.entry;
  const parent = owner?.i;
  if (!item || !category) {
    return null;
  }
  const file = storyFileFor(slug);
  return (
    <main className='mx-auto w-full max-w-[1100px] px-6 pb-24 pt-14 md:px-10'>
      <Crumbs
        trail={[
          { label: info.label, href: `/${kind}` },
          ...(category.id === 'all' ? [] : [{ label: category.label, href: `/${kind}/category/${category.id}` }]),
          ...(parent ? [{ label: parent.title, href: `/${kind}/${parent.slug}` }] : []),
          { label: item.title },
        ]}
      />
      <h1 className='text-foreground mt-4 text-4xl font-bold tracking-tight'>{item.title}</h1>
      <p className='mt-3 max-w-xl text-base text-neutral-500'>{item.description}</p>
      {file ? (
        <StoryGallery
          file={file}
          url={kind === 'blocks' && !parent ? `app.acme.com/${slug}` : undefined}
        />
      ) : (
        <div className='bg-foreground/[0.03] ring-foreground/10 mt-10 flex h-[420px] items-center justify-center rounded-2xl ring-1'>
          <SoonBadge />
        </div>
      )}
    </main>
  );
}
