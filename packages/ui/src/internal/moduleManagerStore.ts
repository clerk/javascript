// Backed by the WeakMap in @clerk/shared/moduleManager so clerk-js can register
// its internal ModuleManager during its own bootstrap (`Clerk` constructor),
// which lets composed UserProfile / OrganizationProfile resolve a real
// moduleManager without requiring the consumer to pass `<ClerkProvider ui={ui} />`.
export { getModuleManager, setModuleManager } from '@clerk/shared/moduleManager';
