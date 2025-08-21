import { GeminiResponse } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8888"

export async function streamChat(
  prompt: string,
  sessionId: string,
  onChunk: (text: string) => void
) {
  let token: string | null = null
  try {
    const raw = localStorage.getItem("toeic-auth-storage")
    if (raw) {
      const parsed = JSON.parse(raw)
      token = parsed?.state?.accessToken || null
    }
  } catch (e) {
    console.error("Cannot parse auth storage", e)
  }

  const res = await fetch(`${API_BASE_URL}/api/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ sessionId, prompt }),
  })

  if (!res.body) return

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split("\n\n")
    buffer = events.pop() || ""

    for (const e of events) {
      if (e.startsWith("data:")) {
        const jsonStr = e.replace(/^data:\s*/, "")
        try {
          const obj: GeminiResponse = JSON.parse(jsonStr)
          const text = obj.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) onChunk(text)
        } catch (err) {
          console.error("parse error", err, e)
        }
      }
    }
  }
}
