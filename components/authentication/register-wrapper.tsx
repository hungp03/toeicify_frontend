"use client"

import { RegisterContent } from "./register"
import withGuestOnly from "@/hoc/with-guest-only"

const RegisterWithProtection = withGuestOnly(RegisterContent)

export default RegisterWithProtection