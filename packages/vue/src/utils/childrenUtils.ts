import { h, Text, type VNode } from 'vue';

import { errorThrower } from '../errors/errorThrower';
import { multipleChildrenInButtonComponent } from '../errors/messages';

type ButtonName = 'SignInButton' | 'SignUpButton' | 'SignOutButton' | 'SignInWithMetamaskButton';

export const normalizeWithDefaultValue = (slotContent: VNode[] | undefined, defaultValue: string) => {
  // Render a button with the default value if no slot content is provided
  if (!slotContent) {
    return h('button', defaultValue);
  }

  // Render a button with the slot content if it's a text node
  if (slotContent[0].type === Text) {
    return h('button', slotContent);
  }

  // Render the slot content as is
  return slotContent;
};

export const assertSingleChild = (slotContent: VNode | VNode[], name: ButtonName) => {
  if (Array.isArray(slotContent)) {
    if (slotContent.length > 1) {
      return errorThrower.throw(multipleChildrenInButtonComponent(name));
    }
    return slotContent[0];
  }

  return slotContent;
};
