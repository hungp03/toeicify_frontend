"use client"

import { ForgotPasswordContent } from "./forgot-password"
import withGuestOnly from "@/hoc/with-guest-only"

const ForgotPasswordWithProtection = withGuestOnly(ForgotPasswordContent)

export default ForgotPasswordWithProtection