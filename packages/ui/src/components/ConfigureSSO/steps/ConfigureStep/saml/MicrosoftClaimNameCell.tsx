import type { LocalizationKey } from '@/customizables';

import { useMicrosoftClaimNameCellController } from './microsoft-claim-name-cell.controller';
import { useMicrosoftClaimNameCellModel } from './microsoft-claim-name-cell.model';
import { MicrosoftClaimNameCellView } from './microsoft-claim-name-cell.view';

export const MicrosoftClaimNameCell = ({ claimNameKey }: { claimNameKey: LocalizationKey }): JSX.Element => {
  const model = useMicrosoftClaimNameCellModel(claimNameKey);
  const controller = useMicrosoftClaimNameCellController(model.claimName);
  return (
    <MicrosoftClaimNameCellView
      {...model}
      {...controller}
    />
  );
};
