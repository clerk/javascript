'use client';

import type { ReactElement } from 'react';

import { useDemoController } from './demo.controller';
import { useDemoModel } from './demo.model';
import type { ReadyDemoModel } from './demo.types';
import { DemoErrorView, DemoLoadingView, DemoView } from './demo.view';

export function Demo(): ReactElement | null {
  const model = useDemoModel();

  if (model.status === 'hidden') {
    return null;
  }
  if (model.status === 'loading') {
    return <DemoLoadingView />;
  }
  if (model.status === 'error') {
    return <DemoErrorView />;
  }

  return (
    <ReadyDemo
      key={model.identity}
      model={model}
    />
  );
}

function ReadyDemo({ model }: { model: ReadyDemoModel }) {
  const controller = useDemoController(model);
  return <DemoView {...controller} />;
}
