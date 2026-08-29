# Subflow: launch from a clean state and land signed out.
launch_app --clear-state
wait_visible_id auth-state 30000
# Wait out clerk-js init ('loading') with a retrying wait; assert_visible
# never retries.
wait_visible_text 45000 "signed in" "signed out"
assert_visible_text "signed out"
