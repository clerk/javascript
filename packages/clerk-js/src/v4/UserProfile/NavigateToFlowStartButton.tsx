import React from 'react';

import { useRouter } from '../../ui/router';
import { Button } from '../customizables';
import { PropsOfComponent } from '../styledSystem';

type NavigateToFlowStartButtonProps = PropsOfComponent<typeof Button>;

export const useNavigateToFlowStart = () => {
  const router = useRouter();
  const navigateToFlowStart = () => {
    return router.navigate('/' + router.basePath + router.startPath);
  };
  return { navigateToFlowStart };
};

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
