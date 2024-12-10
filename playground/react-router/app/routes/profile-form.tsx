import { redirect, Form } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { createClerkClient } from "@clerk/react-router/api.server";
import type { Route } from "./+types/profile";

export async function action(args: Route.ActionArgs) {
  const { userId } = await getAuth(args)

  if (!userId) {
    return redirect("/sign-in?redirect_url=" + args.request.url)
  }

  const formData = await args.request.formData()
  const name = await formData.get('name')
  const user = await createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY }).users.getUser(userId)

  return {
    name,
    user: JSON.stringify(user),
  }
}

export default function Profile({ actionData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Profile Data</h1>
      <Form method="post">
        <label htmlFor="name">Name</label>
        <input type="text" name="name" id="name" />
        <button type="submit">Submit</button>
      </Form>
      {actionData ? (
        <pre>
        <code>
          {JSON.stringify(actionData, null, 2)}
        </code>
      </pre>
      ) : null}
    </div>
  )
}