"use client"

import {FlashcardStudyContent} from "./flashcard-study"
import withAuth from "@/hoc/with-auth"

const FlashcardStudyWithProtection = withAuth(FlashcardStudyContent)

export default FlashcardStudyWithProtection