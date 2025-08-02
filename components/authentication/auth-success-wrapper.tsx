"use client"

import { Suspense } from "react"
import { AuthSuccessContent, AuthSuccessFallback } from "./auth-success"
import { withAuthRedirectProtection } from "@/hoc/with-auth-redirect"

// Client component có HOC và Suspense
const AuthSuccessWithProtection = withAuthRedirectProtection(() => {
  return (
    <Suspense fallback={<AuthSuccessFallback />}>
      <AuthSuccessContent />
    </Suspense>
  )
})

export default AuthSuccessWithProtection