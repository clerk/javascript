import { ContentPage as BaseContentPage } from '../../elements';
import { PropsOfComponent } from '../../styledSystem';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

export const ContentPage = (props: PropsOfComponent<typeof BaseContentPage>) => {
  const { Breadcrumbs } = props;
  return (
    <BaseContentPage
      {...props}
      Breadcrumbs={Breadcrumbs === null ? null : OrganizationProfileBreadcrumbs}
    />
  );
};
