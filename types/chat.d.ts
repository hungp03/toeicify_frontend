export type GeminiResponse = {
  candidates: {
    content: { parts: { text: string }[] }
    finishReason: string | null
  }[]
}
