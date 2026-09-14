type EnvironmentVariables = {
  public: Map<string, string>;
  private: Map<string, string>;
};

type InstanceKeyLoader = () => Promise<{ pk: string; sk: string }>;

export type EnvironmentConfig = {
  setInstanceKeyLoader(loader?: InstanceKeyLoader): EnvironmentConfig;
  resolve(): Promise<EnvironmentConfig>;
  get id(): string;
  setId(newId: string): EnvironmentConfig;
  setEnvVariable(type: keyof EnvironmentVariables, name: string, value: any): EnvironmentConfig;
  get publicVariables(): EnvironmentVariables['public'];
  get privateVariables(): EnvironmentVariables['private'];
  toJson(): { public: Record<string, string>; private: Record<string, string> };
  fromJson(json: ReturnType<EnvironmentConfig['toJson']>): EnvironmentConfig;
  clone(): EnvironmentConfig;
};

export const environmentConfig = () => {
  let id = '';
  let loadInstanceKeys: InstanceKeyLoader | undefined;
  const envVars: EnvironmentVariables = {
    public: new Map<string, string>(),
    private: new Map<string, string>(),
  };

  const self: EnvironmentConfig = {
    setInstanceKeyLoader: loader => {
      loadInstanceKeys = loader;
      return self;
    },
    resolve: async () => {
      if (loadInstanceKeys) {
        const { pk, sk } = await loadInstanceKeys();
        const secretKey = envVars.private.has('CLERK_DYNAMIC_SECRET_KEY')
          ? 'CLERK_DYNAMIC_SECRET_KEY'
          : 'CLERK_SECRET_KEY';
        self.setEnvVariable('private', secretKey, sk).setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', pk);
      }
      return self;
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
      const res = environmentConfig().setInstanceKeyLoader(loadInstanceKeys);
      envVars.private.forEach((v, k) => res.setEnvVariable('private', k, v));
      envVars.public.forEach((v, k) => res.setEnvVariable('public', k, v));
      return res;
    },
  };

  return self;
};
