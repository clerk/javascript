# Native UserButton -> account sheet -> native sign-out, asserting the JS
# layer observes it (the reverse bridge direction from sign-in.sh).
# clerk-android exposes no test identifiers (no testTag / resource-ids), so
# shared selectors are English text / accessibility labels.
#
# Ends with a second sign-in in the SAME app process (no restart, no clean
# state): a past regression had the second native sign-in complete natively
# while the JS SDK never observed it. Every other flow cold-launches with
# clean state, so this is the only place that path is exercised.
run_flow subflows/open-app.sh
tap_on_id open-auth-view-button
run_flow subflows/sign-in-email-password.sh
run_flow subflows/assert-signed-in.sh
# iOS labels the trigger "Open account"; Android "Open user profile".
tap_on_text "Open account" "Open user profile"
wait_visible_text 15000 "Manage account"
assert_visible_text "Sign out"
tap_on_text "Sign out"
run_flow subflows/assert-signed-out.sh
# Second sign-in without restarting the app: the remounted AuthView must
# work and the JS layer must observe the new session.
tap_on_id open-auth-view-button
run_flow subflows/sign-in-email-password.sh
run_flow subflows/assert-signed-in.sh
tap_on_id sign-out-button
run_flow subflows/assert-signed-out.sh
