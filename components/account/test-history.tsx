'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon } from 'lucide-react';
import { getMyAttemptHistory } from '@/lib/api/attempts';
import {
  AttemptItem,
  AttemptHistoryRow,
  ExamHistory,
  PaginationMeta,
} from '@/types/attempts';
import { Pagination } from '@/components/common/pagination';

function fmtDate(iso?: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('vi-VN');
}

function fmtDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function AttemptHistory() {
  const [page, setPage] = useState(1); // 1-based
  const size = 5;

  const [rows, setRows] = useState<AttemptHistoryRow[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getMyAttemptHistory(page, size);
        if (!mounted) return;
        setRows(res.result || []);
        setMeta(res.meta);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page]);

  // Group theo examId
  const grouped: ExamHistory[] = useMemo(() => {
    const map = new Map<number, ExamHistory>();
    for (const r of rows) {
      if (!map.has(r.examId)) {
        map.set(r.examId, {
          examId: r.examId,
          examName: r.examName,
          attempts: [],
        });
      }
      map.get(r.examId)!.attempts.push(r.attempt);
    }
    return Array.from(map.values());
  }, [rows]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        Đang tải lịch sử làm bài…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.length === 0 ? (
        <div className="text-muted-foreground text-center py-6">
          Bạn chưa có lịch sử làm bài.
        </div>
      ) : (
        grouped.map((exam) =>
          exam.attempts.map((a) => {
            const totalScore = a.toeicScore ?? 0;
            const listening =  0;
            const reading =  0;
            const duration = fmtDuration(a.durationSeconds);
            const date = fmtDate(a.endTime || a.startTime);

            return (
              <div
                key={a.attemptId}
                className="flex items-center justify-between rounded-lg border p-4 shadow-sm hover:shadow transition"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    {exam.examName}
                  </h3>
                  <div className="text-sm text-muted-foreground flex flex-wrap gap-4">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{date}</span>
                    </div>
                    <span>Listening: {listening}/495</span>
                    <span>Reading: {reading}/495</span>
                    <span>Time: {duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-900">
                    {totalScore}/990
                  </div>
                  <Link
                    href={`/attempts/${a.attemptId}`}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            );
          })
        )
      )}

      {meta && meta.pages > 1 && (
        <div className="pt-6 flex justify-center">
          <Pagination
            totalPages={meta.pages}
            currentPage={meta.page - 1}
            onPageChange={(p0) => setPage(p0 + 1)}
            siblingCount={1}
          />
        </div>
      )}
    </div>
  );
}
