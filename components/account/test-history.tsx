"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarIcon, Clock, Target, ExternalLink } from "lucide-react"
import { getMyAttemptHistory } from "@/lib/api/attempts"
import type { AttemptHistoryRow, ExamHistory, PaginationMeta } from "@/types/attempts"
import { Pagination } from "@/components/common/pagination"

/* Helpers */
function fmtDate(iso?: string | null) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("vi-VN")
}

function fmtDuration(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function Badge({
  variant = "secondary",
  children,
}: {
  variant?: "primary" | "secondary" | "success"
  children: React.ReactNode
}) {
  const styles = {
    primary: "bg-blue-100 text-blue-700 border-blue-200",
    secondary: "bg-orange-100 text-orange-700 border-orange-200",
    success: "bg-green-100 text-green-700 border-green-200",
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${styles[variant]}`}>
      {children}
    </span>
  )
}

export default function AttemptHistory() {
  const [page, setPage] = useState(1)
  const size = 5

  const [rows, setRows] = useState<AttemptHistoryRow[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const res = await getMyAttemptHistory(page, size)
        if (!mounted) return
        setRows(res.result || [])
        setMeta(res.meta || null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [page])

  // Group theo examId
  const grouped: ExamHistory[] = useMemo(() => {
    const map = new Map<number, ExamHistory>()
    for (const r of rows) {
      if (!map.has(r.examId)) {
        map.set(r.examId, { examId: r.examId, examName: r.examName, attempts: [] })
      }
      map.get(r.examId)!.attempts.push(r.attempt)
    }
    return Array.from(map.values())
  }, [rows])

  if (loading) {
    return (
      <div className="py-16">
        <div className="mx-auto w-full max-w-3xl rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            <span>Đang tải lịch sử làm bài…</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-8">
      {grouped.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
          <CalendarIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Chưa có lịch sử làm bài</h3>
          <p className="text-gray-500">Bắt đầu làm bài thi để xem lịch sử tại đây.</p>
        </div>
      ) : (
        grouped.map((exam) => (
          <article key={exam.examId} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            {/* Header Exam */}
            <header className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="truncate text-lg font-semibold text-gray-900">{exam.examName}</h2>
            </header>

            {/* Attempts list */}
            <ul className="divide-y divide-gray-200">
              {exam.attempts.map((a) => {
                const date = fmtDate(a.endTime || a.startTime)
                const duration = fmtDuration(a.durationSeconds)
                const isFull = Boolean(a.fullTest)
                const resultText = isFull ? `${a.correct ?? 0}/200` : `${a.correct ?? 0}/${a.total ?? 0}`

                return (
                  <li key={a.attemptId} className="p-6 hover:bg-gray-50">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      {/* Left: date + badges */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{date}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {isFull ? (
                            <Badge variant="success">Full test</Badge>
                          ) : (
                            <>
                              <Badge variant="secondary">Luyện tập</Badge>
                              {a.parts?.map((p) => (
                                <Badge key={p} variant="secondary">
                                  Part {p}
                                </Badge>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 md:justify-end">
                        <div className="text-right">
                          <div className="mb-1 flex items-center gap-2 text-sm text-gray-500 md:justify-end">
                            <Clock className="h-4 w-4" />
                            <span>Thời gian</span>
                          </div>
                          <div className="font-medium text-gray-900">{duration}</div>
                        </div>

                        <Link
                          href={`/practice-tests/result/${a.attemptId}`}
                          className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                        >
                          <span>Xem chi tiết</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </article>
        ))
      )}

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <div className="pt-6">
          <div className="flex justify-center">
            <Pagination
              totalPages={meta.pages}
              currentPage={meta.page - 1}
              onPageChange={(p0) => setPage(p0 + 1)}
              siblingCount={1}
            />
          </div>
        </div>
      )}
    </section>
  )
}