# Dismiss the native AuthView mid-flow and reopen it: the native view must
# survive detach/reattach and still complete a sign-in afterwards. Dismissal
# is the platform-native gesture: Android's system back button (doubling as
# the back-dismisses-AuthView regression), iOS's sheet Close control
# (clerk-ios exposes the stable clerk.dismissButton identifier).
# Also asserts the custom `logo` React element is rehosted into the native
# logo slot with a nonzero size, both on first mount and after reattach.
run_flow subflows/open-app.sh
tap_on_id open-auth-view-button
wait_visible_text 25000 "Welcome! Sign in to continue" "Welcome! Sign in to continue."
# Retrying wait (not assert_visible): the rehosted logo is sized on the first
# RN layout pass, so it can lag the welcome copy by a frame or two.
wait_visible_text 10000 "E2E Custom Logo"
if is_platform android; then
  back_system
fi
if is_platform ios; then
  tap_on_id clerk.dismissButton
fi
wait_visible_id open-auth-view-button 15000
tap_on_id open-auth-view-button
wait_visible_text 15000 "E2E Custom Logo"
run_flow subflows/sign-in-email-password.sh
run_flow subflows/assert-signed-in.sh
tap_on_id sign-out-button
run_flow subflows/assert-signed-out.sh
