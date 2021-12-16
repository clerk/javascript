export default function filterKeys(
  data: Record<string, any>,
  allowedKeys: Array<string>
) {
  return Object.keys(data)
    .filter((key) => allowedKeys.includes(key))
    .reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {} as Record<string, any>);
}
