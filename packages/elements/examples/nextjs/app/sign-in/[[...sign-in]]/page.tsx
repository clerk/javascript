import {
  Field,
  Form,
  Input,
  Label,
  SignIn,
  SignInFactorOne,
  SignInFactorTwo,
  SignInSSOCallback,
  SignInStart,
  Submit,
} from '@clerk/elements';

export default function SignInPage() {
  return (
    <SignIn>
      <div className='m-auto w-max text-sm'>
        <SignInStart>
          <h1 className='text-xl mb-6'>Start</h1>

          <Form className='flex gap-6 flex-col '>
            <Field
              name='identifier'
              className='flex gap-4 justify-between items-center '
            >
              <Label htmlFor='password'>Email</Label>
              <Input
                type='identifier'
                className='bg-tertiary rounded-sm px-2 py-1 border border-foreground'
              />

              {/* <input type="text" name="identifier" placeholder="identifier" /> */}
              {/* <button type="submit">Continue</button> */}
            </Field>

            <Field
              name='password'
              className='flex gap-4 justify-between items-center'
            >
              <Label htmlFor='password'>Password</Label>
              <Input
                type='password'
                className='bg-tertiary rounded-sm px-2 py-1 border border-foreground'
              />
            </Field>

            <Submit className='px-4 py-2 b-1 bg-blue-950 bg-opacity-20 hover:bg-opacity-10 active:bg-opacity-5 rounded-md dark:bg-opacity-100 dark:hover:bg-opacity-80 dark:active:bg-opacity-50 transition'>
              Sign In
            </Submit>
          </Form>
        </SignInStart>
        <SignInFactorOne>
          <p>Factor one child</p>
        </SignInFactorOne>
        <SignInFactorTwo>
          <p>Factor two child</p>
        </SignInFactorTwo>
        <SignInSSOCallback />
      </div>
    </SignIn>
  );
}
