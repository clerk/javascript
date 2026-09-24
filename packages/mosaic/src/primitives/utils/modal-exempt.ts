const MODAL_EXEMPT_ATTRIBUTE = 'data-cl-modal-exempt';

export const modalExemptProps = { [MODAL_EXEMPT_ATTRIBUTE]: '' } as const;

export function getModalExemptElements(node: Node | null | undefined): Element[] {
  const doc = node?.ownerDocument ?? (typeof document === 'undefined' ? null : document);
  return doc ? Array.from(doc.querySelectorAll(`[${MODAL_EXEMPT_ATTRIBUTE}]`)) : [];
}
