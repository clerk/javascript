import { withCardStateProvider } from '@/ui/elements/contexts';
import { useInvitationAcceptanceController } from '@/ui/hooks/useInvitationAcceptanceController';

import type { OrganizationListSuggestion } from './organization-list.types';
import { SuggestionView } from './organization-list-suggestion.view';

export const SuggestionPreview = withCardStateProvider(({ model }: { model: OrganizationListSuggestion }) => {
  const acceptance = useInvitationAcceptanceController(model.accept);

  return (
    <SuggestionView
      organizationData={model.organizationData}
      isAccepted={model.isAccepted}
      isLoading={acceptance.isLoading}
      onAccept={() => void acceptance.onAccept()}
    />
  );
});
