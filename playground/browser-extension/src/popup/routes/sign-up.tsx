import { SignUp } from "@clerk/chrome-extension";

export const SignUpPage = () => {
  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-h-[543px] plasmo-overflow-y-auto">
      <SignUp
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
