# Embedded UserProfileView (onHostBack): internal navigation stays native,
# and the host-supplied root back button closes the screen from JS.
run_flow subflows/open-app.sh
tap_on_id open-auth-view-button
run_flow subflows/sign-in-email-password.sh
run_flow subflows/assert-signed-in.sh
tap_on_id open-embedded-profile-button
# The internal push differs per platform: clerk-ios pushes a Security screen
# from the profile root, clerk-android uses tabs at the root and pushes the
# Manage account screen instead. The double-Back contract below is the same:
# both back buttons read 'Back' but only one exists at a time, so the first
# tap pops Clerk's internal stack and the second is the host chevron firing
# onHostBack.
if is_platform ios; then
  wait_visible_text 20000 "Security"
  tap_on_text "Security"
  wait_visible_text 15000 "Password" "Passkeys" "Two-step verification" "Active devices"
  tap_on_button_text "Back"
  wait_visible_text 15000 "Security"
fi
if is_platform android; then
  wait_visible_text 20000 "Edit profile"
  tap_on_text "Manage account"
  wait_visible_text 15000 "EMAIL ADDRESSES" "Add email address"
  tap_on_button_text "Back"
  wait_visible_text 15000 "Edit profile"
fi
tap_on_button_text "Back"
wait_visible_id open-embedded-profile-button 15000
tap_on_id sign-out-button
run_flow subflows/assert-signed-out.sh
