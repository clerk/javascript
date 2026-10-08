import { useUserProfileRoutesModel } from './user-profile-routes.model';
import { UserProfileRoutesView } from './user-profile-routes.view';

export const UserProfileRoutes = () => {
  const model = useUserProfileRoutesModel();

  return <UserProfileRoutesView {...model} />;
};
