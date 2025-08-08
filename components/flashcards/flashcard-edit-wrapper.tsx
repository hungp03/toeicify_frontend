"use client"

import {FlashcardEditContent} from "./flashcard-edit"
import withAuth from "@/hoc/with-auth"

const FlashcardEditWithProtection = withAuth(FlashcardEditContent)

export default FlashcardEditWithProtection