# Subflow: enter email + password into the native AuthView and submit.
# Requires CLERK_TEST_EMAIL and CLERK_TEST_PASSWORD env vars.
wait_visible_text 25000 "Welcome! Sign in to continue" "Welcome! Sign in to continue."
# The AuthView sometimes renders its welcome text a beat before the email
# field; don't tap until the field is actually present. The placeholder
# varies by instance config (email-only vs email+username).
wait_visible_text 25000 "Enter your email" "Enter your email or username"

# The retry gates on reaching the next step, so a mangled identifier gets a
# clean second attempt.
enter_identifier_and_continue() {
  tap_on_text "Enter your email" "Enter your email or username"
  wait_for_animation_to_end 2000
  # A remounted AuthView prefills the last-used identifier (Clerk persists it
  # in secure-store, surviving clearState). Only retype when the field does
  # not already hold the right value.
  if ! is_visible_text "$CLERK_TEST_EMAIL"; then
    input_text "$IDENTIFIER_FIELD" "$CLERK_TEST_EMAIL"
  fi
  # Wait for the typed value to land before tapping: the tap can race the
  # recomposition that enables the button, and this also catches a mangled
  # identifier inside the retry instead of at the next screen's timeout.
  wait_visible_text 5000 "$CLERK_TEST_EMAIL"
  wait_for_animation_to_end 2000
  tap_on_text "Continue"
  # Which first factor comes next depends on instance config AND SDK:
  # clerk-ios can go email-code-first where clerk-android goes
  # password-first. Accept either screen.
  wait_visible_text 15000 "Enter your password" "Check your email"
}
retry 2 enter_identifier_and_continue

# Instances that offer the email link first (clerk-android prefers it when
# available) land on a screen no automation can complete; switch to the
# password strategy. Never taken on the CI instance.
if is_visible_text "Open email app"; then
  tap_on_text "Use another method"
  tap_on_text "Sign in with your password"
fi
# Email-code-first: for +clerk_test@ emails the documented test code is
# 424242: https://clerk.com/docs/testing/test-emails-and-phones
if is_visible_text "Check your email"; then
  input_text "$CODE_FIELD" "424242"
  wait_for_animation_to_end 5000
fi
if is_visible_text "Enter your password"; then
  tap_on_text "Enter your password"
  input_text "$PASSWORD_FIELD" "$CLERK_TEST_PASSWORD"
  # The password is masked so its value can't be asserted; settle for the
  # screen going stable so the tap doesn't race the enabling recomposition.
  wait_for_animation_to_end 2000
  tap_on_text "Continue"
  wait_for_animation_to_end 5000
fi
# Some instances ask for the email code after the password instead.
if is_visible_text "Check your email"; then
  input_text "$CODE_FIELD" "424242"
  wait_for_animation_to_end 5000
fi
# Android Google Password Manager may prompt to save the password.
if is_visible_substring "Google Password Manager"; then
  tap_on_text "Not now" "Never"
  wait_for_animation_to_end 2000
fi
# iOS system Save Password / iCloud Keychain prompt overlays the app.
if is_visible_text "Save Password" "Strong Password" "Use Strong Password" "AutoFill Passwords"; then
  tap_on_text "Not Now" "Never for This Website" "Don't Save" || true
  wait_for_animation_to_end 2000
fi
