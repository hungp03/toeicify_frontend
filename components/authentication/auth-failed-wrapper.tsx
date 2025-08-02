"use client"

import { Suspense } from "react"
import { AuthFailedContent, AuthFailedFallback } from "./auth-failed"
import { withAuthRedirectProtection } from "@/hoc/with-auth-redirect"

const AuthFailedWithProtection = withAuthRedirectProtection(() => {
  return (
    <Suspense fallback={<AuthFailedFallback />}>
      <AuthFailedContent />
    </Suspense>
  )
})

export default AuthFailedWithProtection