import { useConfigureDirectorySync } from '../ConfigureDirectorySyncContext';

export const useAttributeMappingStepModel = () => {
  const { directory } = useConfigureDirectorySync();
  const rows = Object.entries(directory?.attributeMapping ?? {})
    .map(([clerkAttribute, scimPath]) => ({ clerkAttribute, scimPath }))
    .sort((a, b) => a.scimPath.localeCompare(b.scimPath));
  return { rows };
};
