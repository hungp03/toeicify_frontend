"use client"

import {FlashcardTestContent} from "./flashcard-test"
import withAuth from "@/hoc/with-auth"

const FlashcardTestWithProtection = withAuth(FlashcardTestContent)

export default FlashcardTestWithProtection