# Cold-boot warmup, not a test. Lets the JS bundle parse and the a11y tree
# populate once, so the first real flow does not eat the cold-start cost and
# flake its in-flow waits. Excluded from the per-flow loop (lives in subflows/).
launch_app --clear-state
wait_visible_id auth-state 90000
