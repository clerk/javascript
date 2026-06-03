import { createContext, useContext } from 'react';

export interface AccordionContextValue {
  value: string[];
  toggle: (itemValue: string) => void;
  disabled: boolean;
  accordionId: string;
}

export const AccordionContext = createContext<AccordionContextValue | null>(null);

export function useAccordionContext() {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error('Accordion compound components must be used within <Accordion>');
  }
  return ctx;
}

export interface AccordionItemContextValue {
  itemValue: string;
  open: boolean;
  disabled: boolean;
  triggerId: string;
  panelId: string;
}

export const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

export function useAccordionItemContext() {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) {
    throw new Error('Accordion.Trigger/Header/Panel must be used within <Accordion.Item>');
  }
  return ctx;
}
