# Sign in via the native AuthView, restart WITHOUT clearing state, and assert
# the session is restored from secure-store with no re-auth (bridge + token
# cache persistence).
run_flow subflows/open-app.sh
tap_on_id open-auth-view-button
run_flow subflows/sign-in-email-password.sh
run_flow subflows/assert-signed-in.sh
stop_app
launch_app
wait_visible_text 45000 "signed in"
assert_visible_id user-id
# Leave the app signed out for whichever flow runs next.
tap_on_id sign-out-button
run_flow subflows/assert-signed-out.sh
