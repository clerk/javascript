import { without } from '@clerk/shared/object';
import { isDeeplyEqual } from '@clerk/shared/react';
import type { PropsWithChildren } from 'react';
import React from 'react';

import type { MountProps, OpenProps } from '../types';

const isMountProps = (props: any): props is MountProps => {
  return 'mount' in props;
};

const isOpenProps = (props: any): props is OpenProps => {
  return 'open' in props;
};

const stripMenuItemIconHandlers = (
  menuItems?: Array<{
    mountIcon?: (el: HTMLDivElement) => void;
    unmountIcon?: (el: HTMLDivElement) => void;
    [key: string]: any;
  }>,
) => {
  return menuItems?.map(({ mountIcon, unmountIcon, ...rest }) => rest);
};

// README: <ClerkHostRenderer/> should be a class pure component in order for mount and unmount
// lifecycle props to be invoked correctly. Replacing the class component with a
// functional component wrapped with a React.memo is not identical to the original
// class implementation due to React intricacies such as the useEffect’s cleanup
// seems to run AFTER unmount, while componentWillUnmount runs BEFORE.

// More information can be found at https://clerk.slack.com/archives/C015S0BGH8R/p1624891993016300

// The function Portal implementation is commented out for future reference.

// const Portal = React.memo(({ props, mount, unmount }: MountProps) => {
//   const portalRef = React.createRef<HTMLDivElement>();

//   useEffect(() => {
//     if (portalRef.current) {
//       mount(portalRef.current, props);
//     }
//     return () => {
//       if (portalRef.current) {
//         unmount(portalRef.current);
//       }
//     };
//   }, []);

//   return <div ref={portalRef} />;
// });

// Portal.displayName = 'ClerkPortal';

/**
 * Used to orchestrate mounting of Clerk components in a host React application.
 * Components are rendered into a specific DOM node using mount/unmount methods provided by the Clerk class.
 */
export class ClerkHostRenderer extends React.PureComponent<
  PropsWithChildren<
    (MountProps | OpenProps) & {
      component?: string;
      hideRootHtmlElement?: boolean;
      rootProps?: JSX.IntrinsicElements['div'];
    }
  >
> {
  private rootRef = React.createRef<HTMLDivElement>();

  componentDidUpdate(_prevProps: Readonly<MountProps | OpenProps>) {
    if (!isMountProps(_prevProps) || !isMountProps(this.props)) {
      return;
    }

    // Remove children and customPages from props before comparing
    // children might hold circular references which deepEqual can't handle
    // and the implementation of customPages relies on props getting new references
    const prevProps = without(_prevProps.props, 'customPages', 'customMenuItems', 'children');
    const newProps = without(this.props.props, 'customPages', 'customMenuItems', 'children');

    // instead, we simply use the length of customPages to determine if it changed or not
    const customPagesChanged = prevProps.customPages?.length !== newProps.customPages?.length;
    const customMenuItemsChanged = prevProps.customMenuItems?.length !== newProps.customMenuItems?.length;

    // Strip out mountIcon and unmountIcon handlers since they're always generated as new function references,
    // which would cause unnecessary re-renders in deep equality checks
    const prevMenuItemsWithoutHandlers = stripMenuItemIconHandlers(_prevProps.props.customMenuItems);
    const newMenuItemsWithoutHandlers = stripMenuItemIconHandlers(this.props.props.customMenuItems);

    if (
      !isDeeplyEqual(prevProps, newProps) ||
      !isDeeplyEqual(prevMenuItemsWithoutHandlers, newMenuItemsWithoutHandlers) ||
      customPagesChanged ||
      customMenuItemsChanged
    ) {
      if (this.rootRef.current) {
        this.props.updateProps({ node: this.rootRef.current, props: this.props.props });
      }
    }
  }

  componentDidMount() {
    if (this.rootRef.current) {
      if (isMountProps(this.props)) {
        this.props.mount(this.rootRef.current, this.props.props);
      }

      if (isOpenProps(this.props)) {
        this.props.open(this.props.props);
      }
    }
  }

  componentWillUnmount() {
    if (this.rootRef.current) {
      if (isMountProps(this.props)) {
        this.props.unmount(this.rootRef.current);
      }
      if (isOpenProps(this.props)) {
        this.props.close();
      }
    }
  }

  render() {
    const { hideRootHtmlElement = false } = this.props;
    const rootAttributes = {
      ref: this.rootRef,
      ...this.props.rootProps,
      ...(this.props.component && { 'data-clerk-component': this.props.component }),
    };

    return (
      <>
        {!hideRootHtmlElement && <div {...rootAttributes} />}
        {this.props.children}
      </>
    );
  }
}
