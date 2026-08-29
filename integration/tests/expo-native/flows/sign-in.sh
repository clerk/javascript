# Native AuthView email+password sign-in, asserting the native->JS session
# sync, then JS-side sign-out asserting the reverse direction.
run_flow subflows/open-app.sh
tap_on_id open-auth-view-button
run_flow subflows/sign-in-email-password.sh
run_flow subflows/assert-signed-in.sh
tap_on_id sign-out-button
run_flow subflows/assert-signed-out.sh
