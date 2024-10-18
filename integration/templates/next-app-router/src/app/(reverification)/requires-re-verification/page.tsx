import { logUserIdActionReverification } from '../actions';
import { ButtonAction } from '../button-action';

function Page() {
  // @ts-ignore
  return <ButtonAction action={logUserIdActionReverification} />;
}

export default Page;
