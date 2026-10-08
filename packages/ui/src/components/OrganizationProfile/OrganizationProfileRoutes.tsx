import { OrganizationProfileRouteGuard } from './organization-profile-routes.guard';
import { useOrganizationProfileRoutesModel } from './organization-profile-routes.model';
import { OrganizationProfileRoutesView } from './organization-profile-routes.view';

type OrganizationProfileRoutesProps = {
  contentRef: React.RefObject<HTMLDivElement>;
};

export const OrganizationProfileRoutes = ({ contentRef }: OrganizationProfileRoutesProps) => {
  const model = useOrganizationProfileRoutesModel();

  return (
    <OrganizationProfileRoutesView
      data={model}
      contentRef={contentRef}
      Guard={OrganizationProfileRouteGuard}
    />
  );
};
