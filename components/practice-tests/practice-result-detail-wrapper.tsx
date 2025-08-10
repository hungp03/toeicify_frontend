"use client"

import TestResultsPage from "./practice-result-detail"
import withAuth from "@/hoc/with-auth"

const TestResultsPageWithProtection = withAuth(TestResultsPage)

export default TestResultsPageWithProtection