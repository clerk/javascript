export type EnvironmentConfig = ReturnType<typeof environmentConfig>;

export const environmentConfig = () => {
  let id = '';
  const envVars = { public: new Map<string, string>(), private: new Map<string, string>() };

  const self = {
    setId: (newId: string) => {
      id = newId;
      return self;
    },
    get id() {
      return id;
    },
    setEnvVariable: (type: keyof typeof envVars, name: string, value: string) => {
      envVars[type].set(name, value);
      return self;
    },
    get publicVariables() {
      return envVars.public;
    },
    get privateVariables() {
      return envVars.private;
    },
    toJson: () => {
      return {
        public: Object.fromEntries(envVars.public),
        private: Object.fromEntries(envVars.private),
      };
    },
    fromJson: (json: ReturnType<typeof self.toJson>) => {
      Object.entries(json.public).forEach(([k, v]) => self.setEnvVariable('public', k, v));
      Object.entries(json.private).forEach(([k, v]) => self.setEnvVariable('private', k, v));
      return self;
    },
    clone: () => {
      const res = environmentConfig();
      envVars.private.forEach((v, k) => res.setEnvVariable('private', k, v));
      envVars.public.forEach((v, k) => res.setEnvVariable('public', k, v));
      return res;
    },
  };

  return self;
};
