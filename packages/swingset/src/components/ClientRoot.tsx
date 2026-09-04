'use client';

import { usePathname } from 'next/navigation';
import * as React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { getModule } from '@/lib/registry';

import { AppSidebar } from './app-sidebar';
import { ThemeToggle } from './ThemeToggle';

function useBreadcrumb() {
  const pathname = usePathname();
  // /components/button → ["Button"]
  // /styles/scroll-area → ["Scroll Area"]
  // The first segment is the group; drop it and surface the entry (plus any sub-path).
  const [groupSlug, ...parts] = pathname.split('/').filter(Boolean);

  // Prefer the registry's own `meta.title`, which is the only source that round-trips a slug back
  // to how the entry is actually written — `scroll-area` → `Scroll Area`, `use-data-table` →
  // `useDataTable`. Fall back to title-casing the slug for any path the registry doesn't cover.
  return parts.map((part, index) => {
    const title = index === 0 ? getModule(groupSlug, part)?.meta.title : undefined;
    return title ?? part.replace(/(^|-)([a-z])/g, (_, sep: string, ch: string) => (sep ? ' ' : '') + ch.toUpperCase());
  });
}

export function ClientRoot({ children }: { children: React.ReactNode }) {
  const crumbs = useBreadcrumb();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='bg-background sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator
            orientation='vertical'
            className='data-vertical:h-4 data-vertical:self-auto mr-2'
          />
          {crumbs.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {crumbs.map((crumb, i) => (
                  <React.Fragment key={crumb}>
                    {i > 0 && <BreadcrumbSeparator className='hidden md:block' />}
                    <BreadcrumbItem className={i < crumbs.length - 1 ? 'hidden md:block' : undefined}>
                      {i < crumbs.length - 1 ? (
                        <BreadcrumbLink href='#'>{crumb}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          <div className='ml-auto'>
            <ThemeToggle />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
