"use client"

import { LoginContent } from "./login"
import withGuestOnly from "@/hoc/with-guest-only"

const LoginWithProtection = withGuestOnly(LoginContent)

export default LoginWithProtection