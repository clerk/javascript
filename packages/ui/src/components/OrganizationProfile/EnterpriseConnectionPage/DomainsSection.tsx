import type { SSOConnection } from '../../ConfigureSSO/configure-sso.types';
import { useDomainsSectionModel } from './domains-section.model';
import { DomainsSectionView } from './domains-section.view';

export const DomainsSection = ({ connection }: { connection: SSOConnection }): JSX.Element | null => {
  const model = useDomainsSectionModel(connection);
  return <DomainsSectionView {...model} />;
};
