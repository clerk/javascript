import Link from 'next/link';

import { CopyHex } from '@/components/marketing/brand/copy-hex';
import { LogoConstruction } from '@/components/marketing/brand/logo-construction';
import { Preview } from '@/components/marketing/lab-home';
import { MosaicMark, MosaicWordmark } from '@/components/marketing/mosaic-mark';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  HEADLINES,
  LOGO_RULES,
  MOTION_PRINCIPLES,
  PROPORTIONS,
  SWATCHES,
  THEME_IDEAS,
  TYPE_ROLES,
  VOICE_TRAITS,
  WORD_LISTS,
} from '@/lib/brand/tokens';
import { getToolMeta } from '@/lib/mosaic-tools/meta';
import { cn } from '@/lib/utils';
const sections = [
  { id: 'logo', label: 'Logo' },
  { id: 'colour', label: 'Colour' },
  { id: 'type', label: 'Type' },
  { id: 'concept', label: 'Concept' },
  { id: 'clerk', label: 'Clerk' },
  { id: 'voice', label: 'Voice' },
  { id: 'motion', label: 'Motion' },
];
const heading = { fontFamily: 'var(--font-heading)' };
function Section({
  id,
  index,
  title,
  lead,
  children,
}: {
  id: string;
  index: string;
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className='border-foreground/10 scroll-mt-8 border-t pb-20 pt-14'
    >
      <div className='mb-10 grid gap-4 md:grid-cols-[200px_1fr]'>
        <span className='font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500'>
          {index} — {title}
        </span>
        <p
          className='text-foreground max-w-[760px] text-[clamp(26px,3.2vw,40px)] font-semibold leading-[1.1] tracking-[-0.035em]'
          style={heading}
        >
          {lead}
        </p>
      </div>
      {children}
    </section>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <span className='font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500'>{children}</span>;
}
export function BrandOverview() {
  return (
    <div className='min-h-svh'>
      <header className='mx-auto flex max-w-[1120px] items-center justify-between px-6 py-6'>
        <Link
          href='/'
          aria-label='Mosaic Components home'
        >
          <MosaicWordmark />
        </Link>
        <div className='flex items-center gap-4'>
          <span className='flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500'>
            <Link
              href='/tools'
              className='hover:text-foreground transition-colors'
            >
              Mosaic Lab
            </Link>
            <span aria-hidden='true'>/</span>
            <span className='text-neutral-700 dark:text-neutral-300'>Brand overview</span>
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className='mx-auto max-w-[1120px] px-6 pb-24 pt-10'>
        <h1
          className='text-foreground max-w-[820px] text-[clamp(44px,7vw,88px)] font-semibold leading-[0.98] tracking-[-0.045em]'
          style={heading}
        >
          Mosaic Components, in one page
        </h1>
        <p className='mt-6 max-w-[620px] text-lg leading-[30px] text-neutral-600 dark:text-neutral-400'>
          Mosaic is the next generation of Clerk&apos;s components: small, composable pieces you can rearrange into
          something that&apos;s yours. This is how the brand looks, sounds and moves.
        </p>
        <nav
          className='mt-10 flex flex-wrap gap-2'
          aria-label='Sections'
        >
          {sections.map(section => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className='border-foreground/15 hover:border-foreground/40 hover:text-foreground rounded-full border px-4 py-2 text-sm text-neutral-700 transition-colors dark:text-neutral-300'
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className='mt-16'>
          <Section
            id='logo'
            index='01'
            title='Logo'
            lead='A notched M, set from five pieces that meet at the corners.'
          >
            <div className='border-foreground/12 overflow-hidden rounded-2xl border p-6 md:p-10'>
              <LogoConstruction />
            </div>

            <div className='mt-5 grid gap-5 md:grid-cols-4'>
              <div className='bg-background text-foreground border-foreground/12 dark flex aspect-[4/3] items-center justify-center rounded-2xl border'>
                <MosaicWordmark size={24} />
              </div>
              <div className='flex aspect-[4/3] items-center justify-center rounded-2xl bg-white'>
                <MosaicWordmark
                  onLight
                  size={24}
                />
              </div>
              <div className='border-foreground/12 flex aspect-[4/3] items-center justify-center rounded-2xl border'>
                <MosaicMark className='text-foreground w-20' />
              </div>
              <div className='border-foreground/12 flex aspect-[4/3] items-center justify-center rounded-2xl border'>
                <div className='flex size-24 items-center justify-center rounded-[22px] bg-white'>
                  <MosaicMark className='w-14 text-neutral-950' />
                </div>
              </div>
            </div>
            <div className='mt-3 grid gap-5 md:grid-cols-4'>
              {['Lockup on dark', 'Lockup on white', 'Mark', 'App tile'].map(label => (
                <Label key={label}>{label}</Label>
              ))}
            </div>

            <div className='mt-14 grid gap-10 md:grid-cols-2'>
              <div>
                <Label>Anatomy</Label>
                <p className='mt-3 text-[15px] leading-6 text-neutral-600 dark:text-neutral-400'>
                  Two L-shaped blocks sit above three legs. The five pieces meet only at their corners, with sharp
                  edges, a mosaic that has been set. The clearspace unit{' '}
                  <span className='font-mono text-neutral-800 dark:text-neutral-200'>x</span> is one leg width. Below
                  120px of lockup width, use the mark alone.
                </p>
              </div>
              <div className='grid grid-cols-2 gap-8'>
                <div>
                  <Label>Do</Label>
                  <ul className='mt-3 flex flex-col gap-2 text-[14px] leading-5 text-neutral-700 dark:text-neutral-300'>
                    {LOGO_RULES.do.map(rule => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Label>Don&apos;t</Label>
                  <ul className='mt-3 flex flex-col gap-2 text-[14px] leading-5 text-neutral-500'>
                    {LOGO_RULES.dont.map(rule => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Section>

          <Section
            id='colour'
            index='02'
            title='Colour'
            lead='Black, white and one violet, used once.'
          >
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              {SWATCHES.map(swatch => (
                <div
                  key={swatch.name}
                  className='border-foreground/12 overflow-hidden rounded-2xl border'
                >
                  <div
                    className={cn('flex h-32 items-end p-4', swatch.on === 'dark' ? 'text-neutral-950' : 'text-white')}
                    style={{ backgroundColor: swatch.hex }}
                  >
                    <span
                      className='text-lg font-semibold tracking-[-0.02em]'
                      style={heading}
                    >
                      {swatch.name}
                    </span>
                  </div>
                  <div className='flex flex-col gap-1.5 p-4'>
                    <CopyHex
                      hex={swatch.hex}
                      className='text-foreground w-fit font-mono text-sm hover:text-neutral-700 dark:hover:text-neutral-300'
                    />
                    <span className='text-[13px] leading-5 text-neutral-600 dark:text-neutral-400'>{swatch.role}</span>
                    <span className='text-xs text-neutral-500'>{swatch.note}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className='mt-10'>
              <Label>Proportion</Label>
              <div className='mt-3 flex h-3 overflow-hidden rounded-full'>
                {PROPORTIONS.map(item => (
                  <div
                    key={item.label}
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                ))}
              </div>
              <div className='mt-3 flex gap-8 text-[13px] text-neutral-600 dark:text-neutral-400'>
                {PROPORTIONS.map(item => (
                  <span key={item.label}>
                    {item.value}% {item.label}
                  </span>
                ))}
              </div>
            </div>
          </Section>

          <Section
            id='type'
            index='03'
            title='Type'
            lead='Geist for headlines, Inter for reading, Geist Mono for labels.'
          >
            <div className='flex flex-col'>
              {TYPE_ROLES.map(role => (
                <div
                  key={role.role}
                  className='border-foreground/10 grid gap-4 border-t py-8 md:grid-cols-[200px_1fr]'
                >
                  <div className='flex flex-col gap-1'>
                    <Label>{role.role}</Label>
                    <span className='text-foreground text-lg'>{role.family}</span>
                    <span className='text-[13px] leading-5 text-neutral-500'>{role.spec}</span>
                  </div>
                  <p
                    className={cn('text-foreground', role.className)}
                    style={{ fontFamily: role.cssVar }}
                  >
                    {role.sample}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section
            id='concept'
            index='04'
            title='Concept'
            lead='Pieces, set into place by you.'
          >
            <p className='max-w-[640px] text-[17px] leading-7 text-neutral-600 dark:text-neutral-400'>
              A mosaic is a picture made of small pieces and the seams between them. That is how Mosaic Components work:
              five tiers (AIOs, pages, sections, blocks and components) each made of the one below, with clear seams
              where you can cut in and change things. Three ideas carry the theme.
            </p>
            <div className='mt-10 grid gap-5 sm:grid-cols-2'>
              {THEME_IDEAS.map(idea => {
                const tool = getToolMeta(idea.toolSlug);
                if (!tool) {
                  return null;
                }
                return (
                  <Link
                    key={idea.name}
                    href={`/tools/${idea.toolSlug}`}
                    className='border-foreground/12 bg-foreground/[0.02] hover:border-foreground/30 group flex flex-col overflow-hidden rounded-2xl border transition-colors'
                  >
                    <div className='border-foreground/10 bg-background relative aspect-[16/9] overflow-hidden border-b'>
                      <Preview slug={idea.toolSlug} />
                    </div>
                    <div className='flex flex-col gap-3 p-5'>
                      <div className='flex items-baseline justify-between'>
                        <h3
                          className='text-foreground text-2xl font-semibold tracking-[-0.03em]'
                          style={heading}
                        >
                          {idea.name}
                        </h3>
                        <span className='font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500'>
                          {idea.mosaic} → {idea.product}
                        </span>
                      </div>
                      <p className='text-sm leading-6 text-neutral-600 dark:text-neutral-400'>{idea.body}</p>
                      <span className='text-foreground text-sm font-medium transition-transform group-hover:translate-x-1'>
                        Try it in {tool.title.toLowerCase()} →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Section>

          <Section
            id='clerk'
            index='05'
            title='Clerk'
            lead="Mosaic is Clerk's, and it has its own name."
          >
            <div className='grid gap-5'>
              <div className='flex max-w-2xl flex-col justify-center gap-6'>
                <p className='text-[17px] leading-7 text-neutral-600 dark:text-neutral-400'>
                  Clerk is the parent and Mosaic Components is the product. The Mosaic name and mark lead in the
                  product&apos;s own surfaces; Clerk appears as &ldquo;by Clerk&rdquo; in the lockup and as the object
                  at the centre of the hero. Clerk&apos;s logo keeps its shape in every treatment.
                </p>
                <ul className='flex flex-col gap-3 text-[14px] leading-5 text-neutral-700 dark:text-neutral-300'>
                  <li>Mosaic leads in the nav. Clerk is the hero object and the footer line.</li>
                  <li>Use the Clerk logo from the Clerk brand files, never redrawn.</li>
                </ul>
                <div
                  className='border-foreground/10 text-foreground flex items-center gap-4 border-t pt-6'
                  style={heading}
                >
                  <MosaicMark className='w-9' />
                  <span className='text-[22px] font-semibold tracking-[-0.03em]'>
                    Mosaic <span className='font-normal text-neutral-600 dark:text-neutral-400'>Components</span>
                  </span>
                  <span className='text-sm text-neutral-500'>by Clerk</span>
                </div>
              </div>
            </div>
          </Section>

          <Section
            id='voice'
            index='06'
            title='Voice'
            lead='Short sentences about real things. A little wit, once.'
          >
            <div className='grid gap-5 md:grid-cols-3'>
              {VOICE_TRAITS.map(trait => (
                <div
                  key={trait.name}
                  className='border-foreground/12 flex flex-col gap-4 rounded-2xl border p-6'
                >
                  <h3
                    className='text-foreground text-2xl font-semibold tracking-[-0.03em]'
                    style={heading}
                  >
                    {trait.name}
                  </h3>
                  <p className='text-sm leading-6 text-neutral-600 dark:text-neutral-400'>{trait.body}</p>
                  <div className='border-foreground/10 mt-auto flex flex-col gap-3 border-t pt-4 text-sm leading-5'>
                    <p className='text-neutral-800 dark:text-neutral-200'>
                      <span className='mr-2 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500'>
                        Do
                      </span>
                      {trait.do}
                    </p>
                    <p className='text-neutral-500'>
                      <span className='mr-2 font-mono text-[11px] uppercase tracking-[0.08em]'>Don&apos;t</span>
                      {trait.dont}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className='mt-10 grid gap-10 md:grid-cols-[1fr_320px]'>
              <div>
                <Label>Headline lines we like</Label>
                <ul className='mt-4 flex flex-col'>
                  {HEADLINES.map(line => (
                    <li
                      key={line}
                      className='border-foreground/10 text-foreground border-t py-4 text-2xl font-semibold tracking-[-0.03em]'
                      style={heading}
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div className='flex flex-col gap-6'>
                <div>
                  <Label>Words we use</Label>
                  <p className='mt-3 text-[15px] leading-7 text-neutral-800 dark:text-neutral-200'>
                    {WORD_LISTS.use.join(' · ')}
                  </p>
                </div>
                <div>
                  <Label>Words we avoid</Label>
                  <p className='mt-3 text-[15px] leading-7 text-neutral-500'>{WORD_LISTS.avoid.join(' · ')}</p>
                </div>
              </div>
            </div>
          </Section>

          <Section
            id='motion'
            index='07'
            title='Motion'
            lead="Pieces slide, flip and settle. They don't just appear."
          >
            <div className='grid gap-5 sm:grid-cols-2'>
              {MOTION_PRINCIPLES.map((item, index) => (
                <div
                  key={item.name}
                  className='border-foreground/12 flex gap-5 rounded-2xl border p-6'
                >
                  <span className='font-mono text-[11px] tracking-[0.08em] text-neutral-500'>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className='flex flex-col gap-2'>
                    <h3
                      className='text-foreground text-lg font-semibold tracking-[-0.02em]'
                      style={heading}
                    >
                      {item.name}
                    </h3>
                    <p className='text-sm leading-6 text-neutral-600 dark:text-neutral-400'>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className='mt-8 text-sm text-neutral-500'>
              See these in practice in the{' '}
              <Link
                href='/tools'
                className='text-neutral-800 underline underline-offset-4 dark:text-neutral-200'
              >
                Mosaic Lab
              </Link>
              .
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}
