# Subflow: assert the JS layer observed the native sign-in (bridge sync).
# wait_visible_* retries until timeout; assert_visible_* does not.
wait_visible_text 30000 "signed in"
assert_visible_id user-id
