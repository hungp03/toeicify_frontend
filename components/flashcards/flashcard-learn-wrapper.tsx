"use client"

import {FlashcardLearnContent} from "./flashcard-learn"
import withAuth from "@/hoc/with-auth"

const FlashcardLearnWithProtection = withAuth(FlashcardLearnContent)

export default FlashcardLearnWithProtection