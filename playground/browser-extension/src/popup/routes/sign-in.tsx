import { SignIn } from "@clerk/chrome-extension";

export const SignInPage = () => {
  return (
    <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-h-[543px] plasmo-overflow-y-auto">
      <SignIn
        appearance={{
          elements: {
            socialButtons: "plasmo-hidden",
            dividerRow: "plasmo-hidden"
          }
        }}
      />
    </div>
  );
};
