import { Association } from '../resources/Enums';

export default function associationDefaults(associations: object) {
  return Object.entries(associations).reduce((obj, [k, v]) => {
    if (v == Association.HasMany) {
      obj[k] = [];
    }
    return obj;
  }, {} as Record<string, any>);
}
