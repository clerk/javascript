---
'@clerk/ui': patch
---

Organization member lists allow one pending role change or removal at a time. Role changes refresh the list after success, and retries clear the previous error. Switching accounts within the same organization resets member page state and stops commands from the previous account.
