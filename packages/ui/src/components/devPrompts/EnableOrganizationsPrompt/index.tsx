import type { __internal_EnableOrganizationsPromptProps } from '@clerk/shared/types';

import { InternalThemeProvider } from '@/ui/styledSystem';

import { useEnableOrganizationsPromptController } from './enable-organizations-prompt.controller';
import { useEnableOrganizationsPromptModel } from './enable-organizations-prompt.model';
import { EnableOrganizationsPromptView } from './enable-organizations-prompt.view';

const EnableOrganizationsPromptInternal = (props: __internal_EnableOrganizationsPromptProps): JSX.Element => {
  const model = useEnableOrganizationsPromptModel();
  const controller = useEnableOrganizationsPromptController(model, props);
  return <EnableOrganizationsPromptView {...controller} />;
};

/**
 * A prompt that allows the user to enable the Organizations feature for their development instance
 * @internal
 */
export const EnableOrganizationsPrompt = (props: __internal_EnableOrganizationsPromptProps): JSX.Element => {
  return (
    <InternalThemeProvider>
      <EnableOrganizationsPromptInternal {...props} />
    </InternalThemeProvider>
  );
};
