import type { ThemableCssProp } from '@/ui/styledSystem';

/**
 * Shared container styles for API key modals when used with a custom modal root.
 * These styles handle the modal positioning and backdrop when the modal is rendered
 * within a custom container (e.g., within UserProfile or OrganizationProfile).
 */
export const getApiKeyModalContainerStyles = (
  modalRoot?: React.MutableRefObject<HTMLElement | null>,
): ThemableCssProp => {
  return [
    { alignItems: 'center' },
    modalRoot
      ? t => ({
          position: 'absolute',
          right: 0,
          bottom: 0,
          backgroundColor: 'inherit',
          backdropFilter: `blur(${t.sizes.$2})`,
          display: 'flex',
          justifyContent: 'center',
          minHeight: '100%',
          height: '100%',
          width: '100%',
          borderRadius: t.radii.$lg,
        })
      : {},
  ];
};
