'use client';

import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { StatusDot } from '@/components/StatusDot';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { StoryModule, StoryStatus, WipSubstatus } from '@/lib/types';

export type SidebarEntry = { mod: StoryModule; componentSlug: string };

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

function SidebarUsageItem({
  usage,
  href,
  isActive,
  status,
  substatus,
}: {
  usage: string;
  href: string;
  isActive: boolean;
  status?: StoryStatus;
  substatus?: WipSubstatus;
}) {
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
              {status ? (
                <StatusDot
                  status={status}
                  substatus={substatus}
                />
              ) : null}
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
  hrefFor,
  pathname,
}: {
  components: SidebarEntry[];
  hrefFor: (componentSlug: string) => string;
  pathname: string;
}) {
  return (
    <SidebarMenu>
      {components.map(({ mod, componentSlug }) => {
        const href = hrefFor(componentSlug);
        // How an entry is USED differs by layer, so the label follows the layer rather
        // than a guess at the title: hooks are called, atomic styles are a set of
        // exports with no single call form worth privileging, localization is a prop rather
        // than a component, and everything else is a component rendered as JSX.
        const usage =
          mod.meta.group === 'Hooks'
            ? `${mod.meta.title}()`
            : mod.meta.group === 'Styles' || mod.meta.group === 'Localization'
              ? mod.meta.title
              : `<${mod.meta.title} />`;
        return (
          <SidebarUsageItem
            key={mod.meta.title}
            usage={usage}
            href={href}
            isActive={pathname === href}
            status={mod.meta.status}
            substatus={mod.meta.substatus}
          />
        );
      })}
    </SidebarMenu>
  );
}

export function SidebarNavGroup({
  group,
  components,
  defaultOpen,
  hrefFor,
}: {
  group: string;
  components: SidebarEntry[];
  defaultOpen: boolean;
  hrefFor: (componentSlug: string) => string;
}) {
  const pathname = usePathname();

  return (
    <Collapsible
      defaultOpen={defaultOpen}
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
                  defaultOpen={components.some(({ componentSlug }) => pathname === hrefFor(componentSlug))}
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
                        hrefFor={hrefFor}
                        pathname={pathname}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarEntryMenu
                  key={group}
                  components={components}
                  hrefFor={hrefFor}
                  pathname={pathname}
                />
              ),
            )}
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
