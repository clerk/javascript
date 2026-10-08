import React from 'react';

import { useUVFactorTwoBackupCodeController } from './uv-factor-two-backup-code.controller';
import { useUVFactorTwoBackupCodeModel } from './uv-factor-two-backup-code.model';
import { UVFactorTwoBackupCodeView } from './uv-factor-two-backup-code.view';

type UVFactorTwoBackupCodeCardProps = {
  onShowAlternativeMethodsClicked?: React.MouseEventHandler;
};

export const UVFactorTwoBackupCodeCard = (props: UVFactorTwoBackupCodeCardProps) => {
  const model = useUVFactorTwoBackupCodeModel();
  const controller = useUVFactorTwoBackupCodeController(model);
  return (
    <UVFactorTwoBackupCodeView
      controller={controller}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
    />
  );
};
