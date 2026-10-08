import { InternalThemeProvider } from '../../../styledSystem';
import { useKeylessPromptController } from './keyless-prompt.controller';
import { type KeylessPromptProps, useKeylessPromptModel } from './keyless-prompt.model';
import { KeylessPromptView } from './keyless-prompt.view';

export { getCurrentState, getResolvedContent } from './keyless-prompt-content';
export type { STATES } from './keyless-prompt-content';

function KeylessPromptInternal(props: KeylessPromptProps) {
  const model = useKeylessPromptModel(props);
  const controller = useKeylessPromptController(model);
  return <KeylessPromptView {...controller} />;
}

export function KeylessPrompt(props: KeylessPromptProps) {
  return (
    <InternalThemeProvider>
      <KeylessPromptInternal {...props} />
    </InternalThemeProvider>
  );
}
