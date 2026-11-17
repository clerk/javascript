'use client';

import { Button } from '@clerk/mosaic/components/button';
import { isRouteName } from '@clerk/mosaic/routing/routes';
import { MosaicRoutingScope } from '@clerk/mosaic/routing/routing-scope';
import type { MosaicRoutingMode } from '@clerk/mosaic/routing/use-mosaic-location';
import { useRouter, useRouterScope } from '@clerk/mosaic/routing/use-router';
import { useEffect, useState } from 'react';

import { RoutedTabs } from './routed-tabs';

function Case({ title, children, note }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className='flex flex-col gap-3 rounded-lg border p-4'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-sm font-medium'>{title}</h2>
        <p className='text-muted-foreground text-sm'>{note}</p>
      </div>
      {children}
    </section>
  );
}

const tabRoutes = { members: '', invitations: 'invitations', settings: 'settings' } as const;

/** The tab is the owner's whole segment. The first tab is the root, so it has no segment of its own. */
export function TabsInLocation({ routing }: { routing: MosaicRoutingMode }) {
  const { route, go } = useRouterScope(tabRoutes, { routing, path: '/tabs', root: 'members' });
  return (
    <Case
      title='Tabs in the location'
      note='The active tab is the segment under /tabs, and the first tab is the root, so it leaves the URL clean. Back moves between tabs, a reload keeps the tab, and a tab the table does not know snaps to the first one with a replace, so Back does not return to it.'
    >
      <RoutedTabs
        value={route}
        onValueChange={value => isRouteName(tabRoutes, value) && go(value)}
        tabs={[
          { value: 'members', label: 'Members', content: 'Everyone in the organization.' },
          { value: 'invitations', label: 'Invitations', content: 'Who has been invited and not yet joined.' },
          { value: 'settings', label: 'Settings', content: 'How membership works here.' },
        ]}
      />
    </Case>
  );
}

const projectRoutes = { list: '', project: 'projects/:project/:tab?' } as const;
const projectTabRoutes = {
  overview: 'projects/:project',
  activity: 'projects/:project/activity',
  settings: 'projects/:project/settings',
} as const;
const projects: Record<string, string> = { website: 'Website', mobile: 'Mobile app' };
const projectName = (id: string) => projects[id] ?? id;

function ProjectView({ project, back }: { project: string; back: () => void }) {
  const { route, go } = useRouter(projectTabRoutes);
  const name = projectName(project);
  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center justify-between gap-2'>
        <p className='text-sm'>{name}</p>
        <Button
          variant='outline'
          onClick={back}
        >
          Back to the projects
        </Button>
      </div>
      <RoutedTabs
        value={route ?? 'overview'}
        onValueChange={value => isRouteName(projectTabRoutes, value) && go(value, { project })}
        tabs={[
          { value: 'overview', label: 'Overview', content: `What the ${name} project is for.` },
          { value: 'activity', label: 'Activity', content: `Recent deployments of ${name}.` },
          { value: 'settings', label: 'Settings', content: `How ${name} is configured.` },
        ]}
      />
    </div>
  );
}

/** Tabs inside one step of a flow: the tab is the trailing part of the owner's segment, read by a nested router. */
export function TabsInStep({ routing }: { routing: MosaicRoutingMode }) {
  const { route, params, go, scope } = useRouterScope(projectRoutes, { routing, path: '/project', root: 'list' });
  return (
    <Case
      title='Tabs inside a step'
      note='The owner routes projects/:project/:tab? and shows the project for it. Inside, a nested useRouter reads the same segment against its own table, projects/:project/activity and so on, so the tab is the last part of the step and goes along with the project in a link.'
    >
      <MosaicRoutingScope scope={scope}>
        {route === 'list' ? (
          <div className='flex flex-wrap gap-2'>
            {Object.entries(projects).map(([id, name]) => (
              <Button
                key={id}
                onClick={() => go('project', { project: id })}
              >
                {name}
              </Button>
            ))}
          </div>
        ) : (
          <ProjectView
            project={params.project ?? ''}
            back={() => go('list')}
          />
        )}
      </MosaicRoutingScope>
    </Case>
  );
}

const laterTabs = ['usage', 'billing', 'limits'];

/** Tabs whose list arrives after mount, the way a profile's pages do: the entry waits until the table can match it. */
export function TabsArrivingLater({ routing }: { routing: MosaicRoutingMode }) {
  const [tabs, setTabs] = useState<readonly string[] | undefined>(undefined);
  useEffect(() => {
    const timer = setTimeout(() => setTabs(laterTabs), 1500);
    return () => clearTimeout(timer);
  }, []);
  const known = tabs ?? [];
  const { route, go } = useRouterScope(Object.fromEntries(known.map((tab, index) => [tab, index === 0 ? '' : tab])), {
    routing,
    path: '/later',
    root: known[0] ?? '',
    ready: tabs !== undefined,
  });
  return (
    <Case
      title='Tabs that arrive later'
      note='The tab list loads for a second and a half. Until it has, the scope passes ready: false, reports no tab and writes nothing, so a link straight to the billing tab is still there when the tabs are known. Without ready the unknown segment would have been replaced with the root before the table could match it.'
    >
      {route === undefined ? (
        <p className='text-muted-foreground text-sm'>Loading the tabs…</p>
      ) : (
        <RoutedTabs
          value={route}
          onValueChange={go}
          tabs={known.map(tab => ({
            value: tab,
            label: tab[0]?.toUpperCase() + tab.slice(1),
            content: `The ${tab} tab.`,
          }))}
        />
      )}
    </Case>
  );
}
