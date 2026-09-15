import { viewTransitionName } from '../../../utils/view-transition';

export interface ContactMotionItem {
  id: string;
  isDefault?: boolean;
}

/**
 * The primary contact leads the list. `sort` is stable, so everything else keeps the order
 * the model handed down.
 */
export function orderPrimaryFirst<TItem extends ContactMotionItem>(items: TItem[]): TItem[] {
  return [...items].sort((a, b) => Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)));
}

/**
 * The separator between two rows belongs to the slot, not to the contact sitting in it, and it
 * is drawn as the item's own border — so naming the item would lift that border out of the page
 * snapshot and fly it along with the row, leaving every separator in the list drifting. Naming
 * what the item *contains* keeps the borders in the static snapshot, where they sit still while
 * the values move between them. It is also what makes the rows safe to overlap: only text and a
 * menu button are ever in flight, so there is no row-sized rectangle needing an opaque fill to
 * stop the two reading through each other.
 *
 * Per-row names rather than `match-element`, which only Chromium implements. Scoped by the
 * rendering instance as well as the row, since two profiles on one page would otherwise claim
 * the same name and abort the transition.
 */
export function contactPartNames(instanceId: string, kind: string, id: string): string[] {
  return ['content', 'actions'].map(part => viewTransitionName('contact', instanceId, kind, id, part));
}

/**
 * One name for the list, not one per row. Only the primary carries the badge, so the name is on
 * exactly one element in each state — the old primary's in the frame before, the new primary's
 * in the frame after. That is a pair, and a paired group interpolates its position, so the badge
 * travels from the row it left to the row it arrived on.
 */
export function contactBadgeName(instanceId: string, kind: string): string {
  return viewTransitionName('contact', instanceId, kind, 'primary-badge');
}

const groups = (names: string[]) => names.map(name => `::view-transition-group(${name})`).join(',');

/** Every row moving at the same pace, which is what a plain reorder is. */
function reorderBase(names: string[]): string {
  return `
    ${groups(names)} {
      animation-duration: var(--cl-duration-slow);
      animation-timing-function: var(--cl-ease-default);
    }
  `;
}

/**
 * The badge crosses the rows it travels between, so it is lifted above them, and it takes the
 * duration of the row it is landing on rather than the one it left — paired things that finish
 * together have to share a duration or they visibly come apart.
 */
function badgeTravel(badgeName: string, duration: string): string {
  return `
    ::view-transition-group(${badgeName}) {
      z-index: 2;
      animation-duration: ${duration};
      animation-timing-function: var(--cl-ease-default);
    }
  `;
}

/**
 * The row being promoted is the one thing in the list that changed because the user said so, so
 * it gets its own motion: it travels above the rows it displaces, over the longer of the two
 * durations. Everything else takes the plain positional morph.
 *
 * `--cl-ease-default`'s overshoot is what makes the landing read as settling rather than
 * stopping, and this is movement, which is what that curve is for.
 */
export function contactPromoteStyles({
  rowNames,
  promotedNames,
  badgeName,
}: {
  rowNames: string[];
  promotedNames: string[];
  badgeName: string;
}): string {
  return `
    ${reorderBase(rowNames)}
    ${groups(promotedNames)} {
      z-index: 1;
      animation-duration: var(--cl-duration-slower);
    }
    ${badgeTravel(badgeName, 'var(--cl-duration-slower)')}
  `;
}

/* ---------------------------------------------------------------------------------------------
 * VARIATION, SET ASIDE: the badge enters and leaves per row instead of travelling between them.
 *
 * Kept because the reasoning is not obvious and the pieces do not survive being described from
 * memory. Visually the travelling badge above won; this one drew too much attention to the row
 * being demoted.
 *
 * The idea: give the badge a name per row rather than one for the list, and render a badge on
 * EVERY row — an empty transparent circle on the ones that are not primary. A name present on
 * both sides of the change pairs, so each row's badge interpolates along its own row's path.
 * Named only where it is visible, it would instead be a bare entrance, and an entering group is
 * positioned where it ends up — so it would appear over a slot its row had not reached yet.
 *
 * The pill and the word inside it were captured apart, so the pill could change shape while the
 * word only faded. A snapshot is an image: morph the badge with the word still inside it and the
 * glyphs stretch with the box.
 *
 *   contactBadgeNames(instanceId, kind, id) => {
 *     badge: viewTransitionName('contact', instanceId, kind, id, 'badge'),
 *     label: viewTransitionName('contact', instanceId, kind, id, 'badge-label'),
 *   }
 *
 * Markup — the real badge on the primary, a seed on every other row:
 *
 *   <Badge color='neutral' xstyle={motionStyles.name(names.badge)}>
 *     <span {...stylex.props(motionStyles.name(names.label))}>{m.primary}</span>
 *   </Badge>
 *
 *   <span aria-hidden {...stylex.props(motionStyles.badgeSeed, motionStyles.name(names.badge))}>
 *     <span {...stylex.props(motionStyles.badgeSeedLabel, motionStyles.name(names.label))} />
 *   </span>
 *
 * Styles the seed needed:
 *
 *   badgeSeed: { alignItems: 'center', borderRadius: radiusVars['--cl-radius-full'],
 *     display: 'inline-flex', flexShrink: 0, height: space['5'],
 *     justifyContent: 'center', width: space['5'] },
 *
 *   // Explicitly boxed, or an empty inline-block has no layout box, is skipped for capture, and
 *   // the group goes back to entering at its destination. The height is the real label's LINE
 *   // BOX: `--cl-text-xs-leading` is a unitless multiplier, so it is only a length once the size
 *   // multiplies it back out. Left at `auto` the box is zero-high, sits centred in the circle,
 *   // and the word travels half the pill on the way out.
 *   badgeSeedLabel: { display: 'inline-block', width: 0,
 *     height: `calc(${typeScaleVars['--cl-text-xs-size']} * ${typeScaleVars['--cl-text-xs-leading']})` },
 *
 * And the rules, given every row's badge and label name plus the promoted and demoted pairs:
 *
 *   // Follow: each badge takes its own row's timing; the promoted row's takes the longer one.
 *   groups(badgeNames) { z-index: 2; animation-duration: var(--cl-duration-slow);
 *     animation-timing-function: var(--cl-ease-default);
 *     // The pill's group height never changes — seed and badge are both one `space['5']` tall —
 *     // so its shape can come from the group. A pill's rounded ends are baked into its image, and
 *     // stretching that image into a narrowing box squashes them into ellipses; `object-fit:
 *     // cover` crops to the solid middle, which fills the box at any width, and the radius plus
 *     // clip cut the silhouette. Correctly round at every frame rather than a picture of one
 *     // being squeezed.
 *     border-radius: var(--cl-radius-full); overflow: clip; }
 *   groups(labelNames) { z-index: 3; ...same timing }
 *   olds(badgeNames), news(badgeNames) { height: 100%; object-fit: cover; width: 100%; }
 *   // The label's group height IS an artefact of the two boxes it is captured in, so the
 *   // article's `height: 100%` stretches the glyphs. Intrinsic size never distorts at all.
 *   // https://jakearchibald.com/2024/view-transitions-handling-aspect-ratio-changes/
 *   olds(labelNames), news(labelNames) { height: auto; width: auto; }
 *   groups([promoted.badge, promoted.label]) { animation-duration: var(--cl-duration-slower); }
 *
 *   // Reveal, scoped to the two rows whose badge actually changes state — one that is the same
 *   // on both sides keeps the UA's symmetric cross-fade, which cannot flicker. Every rule needs
 *   // an explicit fill mode: the `animation` shorthand resets `animation-fill-mode` to `none`
 *   // and takes the UA's `both` with it, so a delayed entrance starts at full opacity and a
 *   // short exit hands the old image back partway through.
 *   //
 *   // `--cl-ease-enter` on the entrance rather than `linear`, so the pill lands opaque well
 *   // before its box stops changing shape and the morph stays visible. The rule that opacity
 *   // takes `linear` is about changes where nothing moves; this one exists to expose movement.
 *   new(promoted.badge) { animation: fadeIn var(--cl-duration-base) var(--cl-ease-enter) both; }
 *   new(promoted.label) { animation: fadeIn var(--cl-duration-base) var(--cl-ease-enter)
 *                                    var(--cl-duration-fast) both; }
 *   olds([demoted.badge, demoted.label]) { animation: fadeOut var(--cl-duration-instant) linear both; }
 * ------------------------------------------------------------------------------------------ */
