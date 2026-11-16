'use client';

import { clsx } from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export type SidebarGroup = {
  title: string;
  href?: string;
  items: Array<{ title: string; href: string }>;
};

function NavLink({ href, children, onNavigate }: { href: string; children: React.ReactNode; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex items-center justify-between gap-2 rounded-md px-2.5 py-1 text-sm/6 transition-colors',
        active
          ? 'bg-gray-950/5 font-medium text-gray-950 dark:bg-white/10 dark:text-white'
          : 'text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white',
      )}
    >
      <span className='truncate'>{children}</span>
    </Link>
  );
}

function Nav({ groups, onNavigate }: { groups: Array<SidebarGroup>; onNavigate?: () => void }) {
  return (
    <nav className='space-y-6 pb-24 pt-6'>
      {groups.map(group => (
        <div key={group.title}>
          <h2 className='mb-1 px-2.5 text-xs/6 font-medium text-gray-400 dark:text-gray-500'>
            {group.href ? (
              <Link
                href={group.href}
                className='hover:text-gray-950 dark:hover:text-white'
              >
                {group.title}
              </Link>
            ) : (
              group.title
            )}
          </h2>
          <ul className='space-y-px'>
            {group.items.map(item => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  onNavigate={onNavigate}
                >
                  {item.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar({ groups }: { groups: Array<SidebarGroup> }) {
  return (
    <aside className='sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 flex-none overflow-y-auto pr-4 md:block'>
      <Nav groups={groups} />
    </aside>
  );
}

export function MobileNav({ groups }: { groups: Array<SidebarGroup> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className='md:hidden'>
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className='rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-950/5 dark:text-gray-400 dark:hover:bg-white/10'
      >
        {open ? 'Close' : 'Menu'}
      </button>
      {open && (
        <div className='absolute inset-x-0 top-full z-40 h-[calc(100dvh-3.5rem)] overflow-y-auto bg-white px-4 dark:bg-gray-950'>
          <Nav
            groups={groups}
            onNavigate={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
