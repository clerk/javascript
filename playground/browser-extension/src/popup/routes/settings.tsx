import { UserProfile } from "@clerk/chrome-extension";

export const Settings = () => {
  return (
    <>
      <h1>Settings</h1>
      <UserProfile routing="virtual" />
    </>
  );
};
