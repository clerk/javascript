'use client';

import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getSidebarGroups } from '@/lib/registry';

const groups = getSidebarGroups();

const COLLAPSED_BY_DEFAULT = new Set(['Blocks', 'Primitives', 'Components', 'Styles', 'Hooks']);

type SidebarEntry = ReturnType<typeof getSidebarGroups>[number]['components'][number];

// Partitions a group's entries by `meta.navigation.category` into subheaded runs. Category and
// entry order both follow first appearance in the registry; uncategorized entries get no subheading.
function byCategory(components: SidebarEntry[]) {
  const categories: { category: string; components: SidebarEntry[] }[] = [];
  for (const component of components) {
    const category = component.mod.meta.navigation?.category ?? '';
    const bucket = categories.find(c => c.category === category);
    if (bucket) {
      bucket.components.push(component);
    } else {
      categories.push({ category, components: [component] });
    }
  }
  return categories;
}

function SidebarUsageItem({ usage, href, isActive }: { usage: string; href: string; isActive: boolean }) {
  const labelRef = React.useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = React.useState(false);

  React.useEffect(() => {
    const label = labelRef.current;
    if (!label) {
      return;
    }
    const check = () => setIsTruncated(label.scrollWidth > label.clientWidth);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(label);
    return () => observer.disconnect();
  }, []);

  return (
    <SidebarMenuItem>
      <Tooltip disabled={!isTruncated}>
        <TooltipTrigger
          delay={300}
          render={
            <SidebarMenuButton
              className='h-auto py-1 text-xs'
              isActive={isActive}
              render={<Link href={href} />}
            >
              <span
                ref={labelRef}
                className='truncate font-mono text-[10px] leading-relaxed'
              >
                {usage}
              </span>
            </SidebarMenuButton>
          }
        />
        <TooltipContent
          side='right'
          className='font-mono text-[10px]'
        >
          {usage}
        </TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  );
}

function SidebarEntryMenu({
  components,
  groupSlug,
  pathname,
}: {
  components: SidebarEntry[];
  groupSlug: string;
  pathname: string;
}) {
  return (
    <SidebarMenu>
      {components.map(({ mod, componentSlug }) => {
        const href = `/${groupSlug}/${componentSlug}`;
        // How an entry is USED differs by layer, so the label follows the layer rather
        // than a guess at the title: hooks are called, atomic styles are a set of
        // exports with no single call form worth privileging, flows are a set of surfaces
        // and the states they take rather than anything you render, and everything else is
        // a component rendered as JSX.
        const usage =
          mod.meta.group === 'Hooks'
            ? `${mod.meta.title}()`
            : mod.meta.group === 'Styles'
              ? mod.meta.title
              : mod.meta.navigation?.category === 'Flows'
                ? (mod.meta.label ?? mod.meta.title)
                : `<${mod.meta.title} />`;
        return (
          <SidebarUsageItem
            key={mod.meta.title}
            usage={usage}
            href={href}
            isActive={pathname === href}
          />
        );
      })}
    </SidebarMenu>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader className='flex h-12 flex-row items-center gap-2 border-b px-4'>
        <svg
          width='160'
          height='160'
          viewBox='0 0 160 160'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          aria-hidden='true'
          className='size-5 shrink-0'
        >
          <rect
            width='160'
            height='160'
            rx='80'
            fill='var(--brand)'
          />
          <path
            d='M111.125 33.4395C112.875 34.6113 113.024 37.0763 111.535 38.5652L98.7464 51.3541C97.5905 52.5099 95.7974 52.6925 94.3426 51.9472C90.0408 49.7434 85.1656 48.5 80 48.5C62.603 48.5 48.5 62.603 48.5 80C48.5 85.1656 49.7434 90.0408 51.9472 94.3426C52.6925 95.7974 52.5099 97.5905 51.3541 98.7464L38.5652 111.535C37.0763 113.024 34.6113 112.875 33.4395 111.125C27.4773 102.224 24 91.5181 24 80C24 49.0721 49.0721 24 80 24C91.5181 24 102.224 27.4773 111.125 33.4395Z'
            fill='white'
            fillOpacity='0.4'
          />
          <path
            d='M97.5 80C97.5 89.665 89.665 97.5 80 97.5C70.335 97.5 62.5 89.665 62.5 80C62.5 70.335 70.335 62.5 80 62.5C89.665 62.5 97.5 70.335 97.5 80Z'
            fill='white'
          />
          <path
            d='M111.535 121.435C113.024 122.924 112.875 125.389 111.125 126.56C102.224 132.523 91.5181 136 80 136C68.4819 136 57.7759 132.523 48.8747 126.56C47.1253 125.389 46.9758 122.924 48.4647 121.435L61.2535 108.646C62.4094 107.49 64.2025 107.307 65.6573 108.053C69.9592 110.257 74.8344 111.5 80 111.5C85.1656 111.5 90.0408 110.257 94.3427 108.053C95.7975 107.307 97.5906 107.49 98.7465 108.646L111.535 121.435Z'
            fill='white'
          />
        </svg>
        <span className='text-sidebar-foreground/70 text-[10px] font-medium'>Mosaic - Swingset</span>
      </SidebarHeader>
      <SidebarContent className='gap-0'>
        {groups.map(({ group, groupSlug, components }) => (
          <React.Fragment key={group}>
            {group === 'Blocks' && <SidebarSeparator className='data-horizontal:w-auto my-1' />}
            <Collapsible
              defaultOpen={!COLLAPSED_BY_DEFAULT.has(group)}
              className='group/collapsible'
            >
              <SidebarGroup
                className='py-1'
                data-section={group}
              >
                <SidebarGroupLabel
                  className='text-sidebar-foreground/50 hover:text-sidebar-foreground/80 h-auto w-full px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider'
                  render={<CollapsibleTrigger />}
                >
                  {group}
                  <ChevronRightIcon className='size-3! ml-auto transition-transform group-data-[open]/collapsible:rotate-90' />
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    {byCategory(components).map(({ category, components }) =>
                      category ? (
                        <Collapsible
                          key={category}
                          // Collapsed by default, unless it holds the page being viewed.
                          defaultOpen={components.some(
                            ({ componentSlug }) => pathname === `/${groupSlug}/${componentSlug}`,
                          )}
                          className='group/category'
                        >
                          <CollapsibleTrigger className='text-sidebar-foreground/40 hover:text-sidebar-foreground/70 flex w-full items-center gap-1 px-2 pb-0.5 pt-2 text-[9px] font-semibold uppercase tracking-wider'>
                            <span
                              aria-hidden='true'
                              className='font-mono text-[10px] leading-none'
                            >
                              └
                            </span>
                            {category}
                            <ChevronRightIcon className='size-2.5! ml-auto transition-transform group-data-[open]/category:rotate-90' />
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className='border-sidebar-border ml-3 border-l pl-1'>
                              <SidebarEntryMenu
                                components={components}
                                groupSlug={groupSlug}
                                pathname={pathname}
                              />
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <SidebarEntryMenu
                          key={group}
                          components={components}
                          groupSlug={groupSlug}
                          pathname={pathname}
                        />
                      ),
                    )}
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          </React.Fragment>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
