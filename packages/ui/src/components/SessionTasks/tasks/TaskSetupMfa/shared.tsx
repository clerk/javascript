import { useSharedFooterModel } from './shared-footer.model';
import { SharedFooterView } from './shared-footer.view';

export { commonIdentifier } from './shared-footer.model';

export function SharedFooterActionForSignOut() {
  const model = useSharedFooterModel();
  return (
    <SharedFooterView
      identifier={model.identifier}
      signOut={model.signOut}
    />
  );
}
