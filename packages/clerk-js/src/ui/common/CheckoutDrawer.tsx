import { Drawer } from '../elements';

type DrawerRootProps = React.ComponentProps<typeof Drawer.Root>;

type CheckoutDrawerProps = React.PropsWithChildren<DrawerRootProps>;

export function CheckoutDrawer(props: CheckoutDrawerProps) {
  return (
    <Drawer.Root {...props}>
      <Drawer.Overlay />
      <Drawer.Content>
        <Drawer.Header title='Checkout' />
        <Drawer.Body>{props.children}</Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
}
