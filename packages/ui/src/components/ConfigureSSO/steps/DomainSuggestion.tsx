import { useDomainSuggestionController } from './domain-suggestion.controller';
import { useDomainSuggestionModel } from './domain-suggestion.model';
import { DomainSuggestionView } from './domain-suggestion.view';

type DomainSuggestionProps = { onSubmit: (domain: string) => Promise<void> };

export const DomainSuggestion = ({ onSubmit }: DomainSuggestionProps): JSX.Element | null => {
  const { domain } = useDomainSuggestionModel();
  const controller = useDomainSuggestionController(domain, onSubmit);
  if (!domain || controller.isDismissed) {
    return null;
  }
  return (
    <DomainSuggestionView
      domain={domain}
      {...controller}
    />
  );
};
