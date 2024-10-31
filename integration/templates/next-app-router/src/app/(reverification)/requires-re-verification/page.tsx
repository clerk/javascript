import { logUserIdActionReverification } from '../actions';
import { ButtonAction } from '../button-action';

function Page() {
  return <ButtonAction action={logUserIdActionReverification} />;
}

export default Page;
