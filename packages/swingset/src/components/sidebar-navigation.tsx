'use client';

import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
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
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { StoryStatus, WipSubstatus } from '@/lib/types';

type NavigationItem = {
  href: string;
  usage: string;
  isActive: boolean;
  status?: StoryStatus;
  substatus?: WipSubstatus;
};

type NavigationCategory = { label: string; items: NavigationItem[] };

export type NavigationGroup = {
  label: string;
  separatorBefore?: boolean;
  categories: NavigationCategory[];
};

const COLLAPSED_BY_DEFAULT = new Set(['Blocks', 'Primitives', 'Components', 'Styles', 'Hooks', 'Localization']);

function SidebarUsageItem({ usage, href, isActive, status, substatus }: NavigationItem) {
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

function NavigationItems({ items }: { items: NavigationItem[] }) {
  return (
    <SidebarMenu>
      {items.map(item => (
        <SidebarUsageItem
          key={item.href}
          {...item}
        />
      ))}
    </SidebarMenu>
  );
}

export function SidebarNavigation({ groups }: { groups: NavigationGroup[] }) {
  return groups.map(({ label, separatorBefore, categories }) => (
    <React.Fragment key={label}>
      {separatorBefore && <SidebarSeparator className='data-horizontal:w-auto my-1' />}
      <Collapsible
        defaultOpen={!COLLAPSED_BY_DEFAULT.has(label)}
        className='group/collapsible'
      >
        <SidebarGroup
          className='py-1'
          data-section={label}
        >
          <SidebarGroupLabel
            className='text-sidebar-foreground/50 hover:text-sidebar-foreground/80 h-auto w-full px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider'
            render={<CollapsibleTrigger />}
          >
            {label}
            <ChevronRightIcon className='size-3! ml-auto transition-transform group-data-[open]/collapsible:rotate-90' />
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              {categories.map(({ label: category, items }) =>
                category ? (
                  <Collapsible
                    key={category}
                    // Collapsed by default, unless it holds the page being viewed.
                    defaultOpen={items.some(item => item.isActive)}
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
                        <NavigationItems items={items} />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <NavigationItems
                    key={label}
                    items={items}
                  />
                ),
              )}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    </React.Fragment>
  ));
}
