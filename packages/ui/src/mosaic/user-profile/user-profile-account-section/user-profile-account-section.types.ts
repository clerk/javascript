/**
 * A failed save, split into the two places the surface can say so: `message` is the banner over
 * the form, `fields` puts copy under a named control and marks it invalid. Either half stands on
 * its own — a rejection with no field to blame carries only a message, and a field-scoped
 * rejection may carry only that.
 *
 * Plain data, so nothing downstream of the model imports a Clerk error. Mapping
 * `ClerkAPIResponseError`'s `meta.paramName` onto these keys is the model's job.
 */
export interface UserProfileFormError<TField extends string = string> {
  /** Why the save failed, as a whole. Rendered in the dialog's negative banner. */
  message?: string;
  /** Why a specific control's value was rejected, keyed by the field it belongs to. */
  fields?: Partial<Record<TField, string>>;
}
