'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon } from 'lucide-react';
import { getMyAttemptHistory } from '@/lib/api/attempts';
import {
  AttemptHistoryRow,
  ExamHistory,
  PaginationMeta,
} from '@/types/attempts';
import { Pagination } from '@/components/common/pagination';

/* Helpers */
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
function Badge({
  color = 'gray',
  children,
}: {
  color?: 'green' | 'orange' | 'gray';
  children: React.ReactNode;
}) {
  const styles =
    color === 'green'
      ? 'bg-green-100 text-green-700'
      : color === 'orange'
      ? 'bg-orange-100 text-orange-700'
      : 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles} mr-2 mt-1`}>
      {children}
    </span>
  );
}

export default function AttemptHistory() {
  // 1-based cho API
  const [page, setPage] = useState(1);
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

  // Group theo examId để hiển thị
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
    <div className="space-y-10">
      {grouped.length === 0 ? (
        <div className="text-muted-foreground text-center py-6">
          Bạn chưa có lịch sử làm bài.
        </div>
      ) : (
        grouped.map((exam) => (
          <div key={exam.examId} className="space-y-3">
            <h2 className="text-lg font-semibold">{exam.examName}</h2>

            <div className="border rounded-lg">
              {/* Header row */}
              <div className="grid grid-cols-12 px-4 py-2 text-sm font-semibold text-gray-700 border-b bg-gray-50 rounded-t-lg">
                <div className="col-span-5 md:col-span-4">Ngày làm</div>
                <div className="col-span-4 md:col-span-5">Kết quả</div>
                <div className="col-span-3 md:col-span-2">Thời gian làm bài</div>
                <div className="hidden md:block md:col-span-1 text-right pr-2"></div>
              </div>

              {/* Items */}
              <div className="divide-y">
                {exam.attempts.map((a) => {
                  const date = fmtDate(a.endTime || a.startTime);
                  const duration = fmtDuration(a.durationSeconds);
                  const isFull = Boolean(a.fullTest);

                  const resultText = isFull
                    ? `${a.correct ?? 0}/200 (Điểm: ${a.toeicScore ?? 0})`
                    : `${a.correct ?? 0}/${a.total ?? 0}`;

                  return (
                    <div key={a.attemptId} className="grid grid-cols-12 items-center px-4 py-3">
                      {/* Ngày làm + badges */}
                      <div className="col-span-5 md:col-span-4 text-gray-800">
                        {date}
                        <div className="mt-1">
                          {isFull ? (
                            <Badge color="green">Full test</Badge>
                          ) : (
                            <>
                              <Badge color="orange">Luyện tập</Badge>
                              {a.parts?.map((p) => (
                                <Badge key={p} color="orange">{`Part ${p}`}</Badge>
                              ))}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Kết quả */}
                      <div className="col-span-4 md:col-span-5 text-gray-900">
                        {resultText}
                      </div>

                      {/* Thời gian */}
                      <div className="col-span-3 md:col-span-2 text-gray-800">
                        {duration}
                      </div>

                      {/* Link chi tiết */}
                      <div className="col-span-12 md:col-span-1 text-right mt-2 md:mt-0">
                        <Link
                          href={`/attempts/${a.attemptId}`}
                          className="text-blue-600 hover:underline"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))
      )}

      {/* Pagination (component của bạn dùng 0-based) */}
      {meta && meta.pages > 1 && (
        <div className="pt-4 flex justify-center">
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
