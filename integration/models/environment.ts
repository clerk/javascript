type EnvironmentVariables = {
  public: Map<string, string>;
  private: Map<string, string>;
};

export type EnvironmentConfig = {
  get id(): string;
  setId(newId: string): EnvironmentConfig;
  setEnvVariable(type: keyof EnvironmentVariables, name: string, value: any): EnvironmentConfig;
  get publicVariables(): EnvironmentVariables['public'];
  get privateVariables(): EnvironmentVariables['private'];
  toJson(): { public: Record<string, string>; private: Record<string, string> };
  fromJson(json: ReturnType<EnvironmentConfig['toJson']>): EnvironmentConfig;
  clone(): EnvironmentConfig;
  setResolver(resolver: (env: EnvironmentConfig) => Promise<void>): EnvironmentConfig;
  resolve(): Promise<void>;
};

export const environmentConfig = () => {
  let id = '';
  let resolver: ((env: EnvironmentConfig) => Promise<void>) | undefined;
  let resolution: Promise<void> | undefined;
  const envVars: EnvironmentVariables = {
    public: new Map<string, string>(),
    private: new Map<string, string>(),
  };

  const self: EnvironmentConfig = {
    setResolver: value => {
      resolver = value;
      resolution = undefined;
      return self;
    },
    resolve: () => {
      resolution ||= resolver ? resolver(self) : Promise.resolve();
      return resolution;
    },
    setId: (newId: string) => {
      id = newId;
      return self;
    },
    get id() {
      return id;
    },
    setEnvVariable: (type, name, value) => {
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
    fromJson: json => {
      Object.entries(json.public).forEach(([k, v]) => self.setEnvVariable('public', k, v));
      Object.entries(json.private).forEach(([k, v]) => self.setEnvVariable('private', k, v));
      return self;
    },
    clone: () => {
      const res = environmentConfig();
      envVars.private.forEach((v, k) => res.setEnvVariable('private', k, v));
      envVars.public.forEach((v, k) => res.setEnvVariable('public', k, v));
      if (resolver) {
        res.setResolver(resolver);
      }
      return res;
    },
  };

  return self;
};
