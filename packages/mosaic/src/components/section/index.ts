/**
 * A compound component for a topic of settings. `Section.Root` stacks groups; each `Section.Group`
 * is named by the `Section.Title` in its `Section.Header`, above a `Section.Body` card holding
 * either `Section.Row`s (one setting each) or a `Section.Items` list of values.
 */
export * as Section from './section.parts';
export { sectionCompactStyles } from './section.styles';
export type {
  SectionActionsProps,
  SectionBodyProps,
  SectionContentProps,
  SectionDescriptionProps,
  SectionGroupProps,
  SectionHeaderProps,
  SectionItemProps,
  SectionItemsProps,
  SectionLabelProps,
  SectionMediaProps,
  SectionMediaSize,
  SectionNoteProps,
  SectionRootProps,
  SectionRowProps,
  SectionTitleProps,
} from './section';
