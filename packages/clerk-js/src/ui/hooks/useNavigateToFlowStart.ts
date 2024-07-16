import { useRouter } from '../router';

export const useNavigateToFlowStart = () => {
  const router = useRouter();
  const userProfileModalFullPath = '/CLERK-ROUTER/VIRTUAL/user';
  const navigateToFlowStart = async () => {
    const to = '/' + router.basePath + router.flowStartPath;

    if (router.fullPath === userProfileModalFullPath) {
      return router.navigate(router.indexPath);
    }

    if (to !== router.currentPath) {
      return router.navigate(to);
    }

    if (router.urlStateParam?.path) {
      return router.navigate('/' + router.basePath + router.urlStateParam?.startPath);
    }
  };
  return { navigateToFlowStart };
};
