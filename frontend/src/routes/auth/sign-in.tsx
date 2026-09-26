import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@clerk/react'

function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <SignIn
        routing="path"
        path="/auth/sign-in"
        signUpUrl="/auth/sign-up"
        forceRedirectUrl="/join"
      />
    </div>
  )
}

export const Route = createFileRoute('/auth/sign-in')({
  component: SignInPage,
})
