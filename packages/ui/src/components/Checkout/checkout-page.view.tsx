export const CheckoutStageView = ({ show, children }: { show: boolean; children: React.ReactNode }) =>
  show ? children : null;
