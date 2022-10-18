import { ContentPage as BaseContentPage } from '../../elements';
import { PropsOfComponent } from '../../styledSystem';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

export const ContentPage = (props: Omit<PropsOfComponent<typeof BaseContentPage>, 'Breadcrumbs'>) => {
  return (
    <BaseContentPage
      {...props}
      Breadcrumbs={OrganizationProfileBreadcrumbs}
    />
  );
};
