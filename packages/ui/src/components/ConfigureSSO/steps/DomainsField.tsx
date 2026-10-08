import { useDomainsFieldController } from './domains-field.controller';
import { DomainsFieldView } from './domains-field.view';

type DomainsFieldProps = {
  onSubmit: (domain: string) => Promise<void>;
  domainNames: readonly string[];
};

export const DomainsField = ({ onSubmit, domainNames }: DomainsFieldProps): JSX.Element => {
  const controller = useDomainsFieldController(onSubmit, domainNames);
  return <DomainsFieldView {...controller} />;
};
