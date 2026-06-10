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
} from '@/components/ui/sidebar';
import { getSidebarGroups } from '@/lib/registry';
import { toSlug } from '@/lib/slug';

const groups = getSidebarGroups();

type ComponentGroupProps = {
  title: string;
  componentSlug: string;
  names: string[];
};

// One controlled Collapsible per component. The group opens when its route becomes
// active, but stays user-toggleable otherwise. It must be controlled (not `defaultOpen`)
// because the instance persists across navigation: `defaultOpen` is only read on init,
// so a route-derived value mutating later trips Base UI's uncontrolled-state warning.
function ComponentGroup({ title, componentSlug, names }: ComponentGroupProps) {
  const pathname = usePathname();
  const docsHref = `/components/${componentSlug}`;
  const isActive = pathname.startsWith(docsHref);
  const [open, setOpen] = React.useState(isActive);

  React.useEffect(() => {
    if (isActive) {
      setOpen(true);
    }
  }, [isActive]);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className='group/collapsible'
    >
      <SidebarGroup>
        <SidebarGroupLabel
          className='group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm'
          render={<CollapsibleTrigger />}
        >
          {title}
          <ChevronRightIcon className='group-data-open/collapsible:rotate-90 ml-auto transition-transform' />
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === docsHref}
                  render={<Link href={docsHref} />}
                >
                  Overview
                </SidebarMenuButton>
              </SidebarMenuItem>
              {names.map(name => {
                const href = `/components/${componentSlug}/${toSlug(name)}`;
                return (
                  <SidebarMenuItem key={name}>
                    <SidebarMenuButton
                      isActive={pathname === href}
                      render={<Link href={href} />}
                    >
                      {name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className='flex h-12 justify-center border-b px-4'>
        <span className='text-sm font-semibold'>Swingset</span>
      </SidebarHeader>
      <SidebarContent className='gap-0'>
        {groups.flatMap(({ stories }) =>
          stories.map(({ mod, componentSlug, names }) => (
            <ComponentGroup
              key={mod.meta.title}
              title={mod.meta.title}
              componentSlug={componentSlug}
              names={names}
            />
          )),
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
