import { Button } from '../customizables';
import { useRouter } from '../router';
import type { PropsOfComponent } from '../styledSystem';

type NavigateToFlowStartButtonProps = PropsOfComponent<typeof Button>;

export const useNavigateToFlowStart = () => {
  const router = useRouter();
  const navigateToFlowStart = async () => {
    const to = '/' + router.basePath + router.startPath;
    if (to !== router.currentPath) {
      return router.navigate(to);
    }

    if (router.urlStateParam?.path) {
      return router.navigate('/' + router.basePath + router.urlStateParam?.startPath);
    }
  };
  return { navigateToFlowStart };
};

export const NavigateToFlowStartButton = (props: NavigateToFlowStartButtonProps) => {
  const { navigateToFlowStart } = useNavigateToFlowStart();
  return (
    <Button
      textVariant='buttonExtraSmallBold'
      variant='ghost'
      onClick={navigateToFlowStart}
      {...props}
    />
  );
};
