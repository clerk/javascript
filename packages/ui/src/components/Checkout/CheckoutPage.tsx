import {
  type CheckoutFetchStatus,
  CheckoutProviderModel,
  type CheckoutStage,
  useCheckoutFetchStatusModel,
  useCheckoutStageModel,
} from './checkout-page.model';
import { CheckoutStageView } from './checkout-page.view';

const Root = ({ children }: { children: React.ReactNode }) => <CheckoutProviderModel>{children}</CheckoutProviderModel>;

const Stage = ({ children, name }: { children: React.ReactNode; name: CheckoutStage }) => {
  const model = useCheckoutStageModel();
  return <CheckoutStageView show={model.stage === name}>{children}</CheckoutStageView>;
};

const FetchStatus = ({ children, status }: { children: React.ReactNode; status: CheckoutFetchStatus }) => {
  const model = useCheckoutFetchStatusModel();
  return <CheckoutStageView show={model.status === status}>{children}</CheckoutStageView>;
};

export { Root, Stage, FetchStatus };
