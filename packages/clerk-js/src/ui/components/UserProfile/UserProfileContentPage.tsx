import { ContentPage as BaseContentPage } from '../../elements';
import { PropsOfComponent } from '../../styledSystem';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

export const ContentPage = (props: Omit<PropsOfComponent<typeof BaseContentPage>, 'Breadcrumbs'>) => {
  return (
    <BaseContentPage
      {...props}
      Breadcrumbs={UserProfileBreadcrumbs}
    />
  );
};
