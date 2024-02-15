declare type WithChildrenProp<P = unknown, IsRequired extends boolean = true, C = React.ReactNode> = P &
  (IsRequired extends true ? { children: NonNullable<C> } : { children?: C });

declare type TODO = any;
