import { defineRule } from '@oxlint/plugins';
import type { ESTree } from '@oxlint/plugins';

export const modelCallbacksReturnClerkCall = defineRule({
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      returnClerkCall:
        'A model callback returns a ClerkCall from callClerk (src/features/clerk/errors.ts), not a Promise, so a Clerk error never reaches the controller.',
    },
  },
  createOnce(context) {
    const check = (node: ESTree.TSFunctionType | ESTree.TSMethodSignature) => {
      const returned = node.returnType?.typeAnnotation;
      if (!returned) {
        return;
      }
      const members = returned.type === 'TSUnionType' ? returned.types : [returned];
      const mixesVoid =
        members.some(member => member.type === 'TSVoidKeyword') && members.some(isReference('ClerkCall'));
      if ((members.some(isReference('Promise')) || mixesVoid) && isModelTypeMember(node)) {
        context.report({ node: returned, messageId: 'returnClerkCall' });
      }
    };
    return { TSFunctionType: check, TSMethodSignature: check };
  },
});

function isReference(name: string) {
  return (type: ESTree.TSType) =>
    type.type === 'TSTypeReference' && type.typeName.type === 'Identifier' && type.typeName.name === name;
}

function isModelTypeMember(node: ESTree.Node): boolean {
  for (let current: ESTree.Node = node; current.parent; current = current.parent) {
    const { parent } = current;
    if (parent.type === 'TSTypeAliasDeclaration' || parent.type === 'TSInterfaceDeclaration') {
      return true;
    }
    if (
      (parent.type === 'TSFunctionType' || parent.type === 'TSMethodSignature') &&
      parent.params.some(param => param === current)
    ) {
      return false;
    }
  }
  return false;
}
