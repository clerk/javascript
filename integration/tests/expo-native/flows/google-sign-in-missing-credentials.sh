# useSignInWithGoogle surfaces the missing-credentials error.
run_flow subflows/open-app.sh
tap_on_id google-sign-in-button
wait_visible_substring 15000 "Google Sign-In credentials not found"
