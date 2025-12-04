import { useRouter } from '../router';

export const useNavigateToFlowStart = () => {
  const router = useRouter();
  const navigateToFlowStart = async () => {
    const to = router.indexPath;

    if (to !== router.currentPath) {
      return router.navigate(to);
    }

    if (router.urlStateParam?.path) {
      return router.navigate('/' + router.basePath + router.urlStateParam?.startPath);
    }
  };
  return { navigateToFlowStart };
};
