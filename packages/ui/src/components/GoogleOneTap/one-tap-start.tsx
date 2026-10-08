import { withCardStateProvider } from '@/ui/elements/contexts';

import { useOneTapController } from './one-tap.controller';
import { useOneTapModel } from './one-tap.model';

function OneTapStartInternal(): JSX.Element | null {
  const model = useOneTapModel();
  useOneTapController(model);
  return null;
}

export const OneTapStart = withCardStateProvider(OneTapStartInternal);
