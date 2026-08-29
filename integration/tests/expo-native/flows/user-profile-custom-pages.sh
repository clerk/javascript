# A custom page's React Native content is mounted as a child of the native host
# and rehosted into the destination its row pushes, then survives the trip back.
run_flow subflows/open-app.sh
tap_on_id open-auth-view-button
run_flow subflows/sign-in-email-password.sh
run_flow subflows/assert-signed-in.sh
tap_on_id open-embedded-profile-button
# Retrying wait: the row list lands a frame after the native profile paints.
wait_visible_text 20000 "E2E Custom Page"
tap_on_text "E2E Custom Page"
wait_visible_text 15000 "Rehosted RN body"
# The Android destination is a bare AndroidView with no back chrome, unlike the
# iOS page which clerk-ios pushes onto its own NavigationStack.
if is_platform ios; then
  tap_on_button_text "Back"
fi
if is_platform android; then
  back_system
fi
wait_visible_text 15000 "E2E Custom Page"
# The host chevron firing onHostBack, which reads 'Back' on both platforms.
tap_on_button_text "Back"
wait_visible_id open-embedded-profile-button 15000
tap_on_id sign-out-button
run_flow subflows/assert-signed-out.sh
