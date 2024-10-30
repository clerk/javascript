import { SignIn } from "@clerk/chrome-extension";

export const SignInPage = () => {
  return (
    <>
      <p>Sign In</p>
      <SignIn routing="virtual" />
    </>
  );
};
