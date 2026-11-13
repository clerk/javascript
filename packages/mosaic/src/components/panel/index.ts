/**
 * A page of content. `Panel.Sections` sit one heading level below `Panel.Title`.
 *
 * ```tsx
 * <Panel.Root>
 *   <Panel.Title>Account</Panel.Title>
 *   <Panel.Sections>
 *     <Section.Root>…</Section.Root>
 *   </Panel.Sections>
 * </Panel.Root>
 * ```
 */
export * as Panel from './panel.parts';
export { usePanelTitle } from './panel';
export type { PanelRootProps, PanelSectionsProps, PanelTitleProps } from './panel';
