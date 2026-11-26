---
'@clerk/mosaic': patch
---

More sign-in, sign-up and organization improvements:

- The email-link screen shows that it's waiting for the link to be opened.
- The code, password and email-link screens name the account in bold in their description, with a "Use a different email" button below.
- The password step lists up to two other sign-in methods below an "or" divider (with "More options" when there are more) and ends with a Back button. Pass the methods as `alternatives` on the password step.
- "Use another method" lists each method as a row you select, such as "Email a code" with the address under it and a "Change" menu when there are several addresses. Nothing is sent until you press "Send code". Social sign-in buttons stay on the first screen and no longer repeat here.
- The code, password and email-link screens end with "Not you? Use a different email" instead of a separate button.
- When an unknown email is entered on combined sign-in, the code step reads "Create your account" and explains that no account uses that email yet.
- The sign-up "continue" step no longer shows social buttons or the "Already have an account?" prompt, and the legal consent checkbox shows its error below it.
- The app logo no longer animates into the user's photo once the account is known.
- Sign-up and the reset-password step can show a live password checklist (`AuthPasswordChecklist`), passed as `passwordRules` or `newPasswordRules`.
- Organization rows can show a second line, such as "Admin · 12 members", "Invited by Sam Lee" or "Matches your @umbrella.com email".
- Joining an invitation from the choose-organization step enters the organization in one step.
