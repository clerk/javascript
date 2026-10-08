import React from 'react';

import { useUVFactorOnePasskeysController } from './uv-factor-one-passkeys.controller';
import { useUVFactorOnePasskeysModel } from './uv-factor-one-passkeys.model';
import { UVFactorOnePasskeysView } from './uv-factor-one-passkeys.view';

type UVFactorOnePasskeysCardProps = {
  onShowAlternativeMethodsClicked?: React.MouseEventHandler;
};

export const UVFactorOnePasskeysCard = (props: UVFactorOnePasskeysCardProps) => {
  const model = useUVFactorOnePasskeysModel();
  const controller = useUVFactorOnePasskeysController(model);
  return (
    <UVFactorOnePasskeysView
      controller={controller}
      onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
    />
  );
};
