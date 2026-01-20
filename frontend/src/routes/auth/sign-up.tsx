import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@clerk/clerk-react'

function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <SignUp
        routing="path"
        path="/auth/sign-up"
        signInUrl="/auth/sign-in"
        afterSignUpUrl="/"
      />
    </div>
  )
}

export const Route = createFileRoute('/auth/sign-up')({
  component: SignUpPage,
})
