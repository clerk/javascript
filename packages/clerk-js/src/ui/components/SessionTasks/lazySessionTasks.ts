import { lazy } from 'react';

export const preloadOrganizationSelectionTask = () =>
  import(/* webpackChunkName:  "session-tasks"*/ './OrganizationSelectionTask');

const LazyOrganizationSelectionTask = lazy(() =>
  import(/* webpackChunkName: "session-tasks"*/ './OrganizationSelectionTask').then(module => ({
    default: module.OrganizationSelectionTask,
  })),
);

export { LazyOrganizationSelectionTask };
