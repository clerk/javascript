import { Destructive } from '@clerk/mosaic/blocks/destructive';
import { Button } from '@clerk/mosaic/components/button';
import { Menu } from '@clerk/mosaic/components/menu';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './destructive.stories?raw';

export const meta: StoryMeta = {
  group: 'Blocks',
  status: 'stable',
  title: 'Destructive',
  source: 'packages/mosaic/src/blocks/destructive/destructive.tsx',
};

// A real delete is a network round trip. Without one the action never renders its pending
// state, so both stories wait before they settle.
const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const trigger = (
  <Button
    color='negative'
    variant='outline'
  >
    Delete account
  </Button>
);

/**
 * The block holds the typed phrase and compares it to `confirmationValue`. Everything that
 * decides what the dialog does next stays with the caller: `open` closes it, `isDeleting`
 * marks it busy, `errorMessage` explains a failure.
 */
export function Default() {
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await settleAfter(2000);
    setIsDeleting(false);
    setOpen(false);
  };

  return (
    <Destructive
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title='Delete account?'
      description='Are you sure you want to delete your account? All of your data will be permanently deleted.'
      fieldLabel='Type “Delete account” below to continue'
      confirmationValue='Delete account'
      actionLabel='Delete account'
      onDelete={() => void handleDelete()}
      isDeleting={isDeleting}
    />
  );
}

/**
 * A failed attempt leaves the dialog up. Pass the sentence the user should read as
 * `errorMessage`, and clear it when the next attempt starts.
 */
export function WithError() {
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

  const handleDelete = async () => {
    setErrorMessage(undefined);
    setIsDeleting(true);
    await settleAfter(2000);
    setIsDeleting(false);
    setErrorMessage('Your subscription is still active. Cancel it before you delete your account.');
  };

  // The error belongs to the caller, so the caller drops it. Without this a reopened dialog
  // still shows why the last attempt failed.
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setErrorMessage(undefined);
    }
  };

  return (
    <Destructive
      open={open}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      title='Delete account?'
      description='Are you sure you want to delete your account? All of your data will be permanently deleted.'
      fieldLabel='Type “Delete account” below to continue'
      confirmationValue='Delete account'
      actionLabel='Delete account'
      onDelete={() => void handleDelete()}
      isDeleting={isDeleting}
      errorMessage={errorMessage}
    />
  );
}

export function WithHandle() {
  const [projects, setProjects] = React.useState([
    { id: 'project_1', name: 'Production' },
    { id: 'project_2', name: 'Staging' },
    { id: 'project_3', name: 'Development' },
  ]);
  const deleteProject = React.useMemo(() => Destructive.createHandle<{ id: string; name: string }>(), []);
  const listRef = React.useRef<HTMLUListElement>(null);

  return (
    <>
      <ul
        ref={listRef}
        aria-label='Projects'
        tabIndex={-1}
        style={{ display: 'grid', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}
      >
        {projects.map(project => (
          <li
            key={project.id}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
          >
            {project.name}
            <Menu.Root>
              <Menu.Trigger
                render={
                  <Button
                    variant='outline'
                    aria-label={`Actions for ${project.name}`}
                  >
                    Actions
                  </Button>
                }
              />
              <Menu.Popup>
                <Menu.Item
                  label='Delete project'
                  color='negative'
                  onClick={() => deleteProject.open(project)}
                >
                  <Menu.Label>Delete project</Menu.Label>
                </Menu.Item>
              </Menu.Popup>
            </Menu.Root>
          </li>
        ))}
      </ul>
      <Destructive
        handle={deleteProject}
        finalFocus={listRef}
        title={project => `Delete ${project.name}?`}
        description={project => `${project.name} and all of its data will be permanently deleted.`}
        fieldLabel={project => `Type “${project.name}” below to continue`}
        confirmationValue={project => project.name}
        actionLabel='Delete project'
        onDelete={async project => {
          await settleAfter(2000);
          if (project.name === 'Production') {
            throw new Error('Production still has active deployments. Remove them before deleting the project.');
          }
          setProjects(current => current.filter(item => item.id !== project.id));
        }}
      />
    </>
  );
}
