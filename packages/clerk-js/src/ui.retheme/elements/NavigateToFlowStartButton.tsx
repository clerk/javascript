import { Button } from '../customizables';
import { useNavigateToFlowStart } from '../hooks';
import type { PropsOfComponent } from '../styledSystem';

type NavigateToFlowStartButtonProps = PropsOfComponent<typeof Button>;

export const NavigateToFlowStartButton = (props: NavigateToFlowStartButtonProps) => {
  const { navigateToFlowStart } = useNavigateToFlowStart();
  return (
    <Button
      textVariant='buttonSmall'
      variant='ghost'
      onClick={navigateToFlowStart}
      {...props}
    />
  );
};
