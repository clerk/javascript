export const createDynamicParamParser =
  ({ regex }: { regex: RegExp }) =>
  <T extends Record<any, any>>({ urlWithParam, entity }: { urlWithParam: string; entity: T }) => {
    const match = regex.exec(urlWithParam);

    if (match) {
      const key = match[1];
      if (key in entity) {
        const value = entity[key] as string;
        return urlWithParam.replace(match[0], value);
      }
    }
    return urlWithParam;
  };
