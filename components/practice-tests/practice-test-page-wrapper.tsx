"use client"

import TestPage from "./practice-test-page"
import withAuth from "@/hoc/with-auth"

const TestPageWithProtection = withAuth(TestPage)

export default TestPageWithProtection