// AttemptHistoryPage.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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

function Badge({
  children,
  color = 'gray',
}: {
  children: React.ReactNode;
  color?: 'green' | 'orange' | 'gray';
}) {
  const map: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    orange: 'bg-amber-100 text-amber-700',
    gray: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mr-2 ${map[color]}`}>
      {children}
    </span>
  );
}

function ResultCell({ a }: { a: AttemptItem }) {
  if (a.fullTest) {
    return (
      <span className="whitespace-nowrap">
        {a.correct}/{a.total}{' '}
        <span className="text-gray-500">(Điểm: {a.toeicScore ?? '—'})</span>
      </span>
    );
  }
  return <span className="whitespace-nowrap">{a.correct}/{a.total}</span>;
}

export default function AttemptHistory() {
  // BE: 1-based
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
        const res = await getMyAttemptHistory(page, size); // 1-based cho API
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

  // Group theo exam để hiển thị
  const grouped: ExamHistory[] = useMemo(() => {
    const map = new Map<number, ExamHistory>();
    for (const r of rows) {
      if (!map.has(r.examId)) {
        map.set(r.examId, { examId: r.examId, examName: r.examName, attempts: [] });
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
      {/* LIST */}
      {grouped.length === 0 ? (
        <div className="text-gray-600">Bạn chưa có lịch sử làm bài.</div>
      ) : (
        grouped.map((exam) => (
          <div key={exam.examId} className="space-y-3">
            <h2 className="text-lg font-semibold">{exam.examName}</h2>

            <div className="border-t">
              {/* Header row */}
              <div className="
                grid gap-x-4 py-2 text-sm font-semibold text-gray-700
                grid-cols-2 md:grid-cols-[minmax(140px,1fr)_minmax(220px,2fr)_minmax(120px,auto)_minmax(100px,auto)]
              ">
                <div>Ngày làm</div>
                <div className="md:col-start-2">Kết quả</div>
                <div className="hidden md:block">Thời gian làm bài</div>
                <div className="hidden md:block text-right pr-2"></div>
              </div>

              {/* Items */}
              <div className="divide-y">
                {exam.attempts.map((a) => (
                  <div key={a.attemptId} 
                  className=" grid items-center py-3 gap-x-4
                  grid-cols-2 md:grid-cols-[minmax(140px,1fr)_minmax(220px,2fr)_minmax(120px,auto)_minmax(100px,auto)]
                ">
                    <div className="text-gray-800">
                      <div>{fmtDate(a.endTime || a.startTime)}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        {a.fullTest ? (
                          <Badge color="green">Full test</Badge>
                        ) : (
                          <>
                            <Badge color="orange">Luyện tập</Badge>
                            {a.parts.map((p) => (
                              <Badge key={p} color="orange">{`Part ${p}`}</Badge>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Col 2: Kết quả */}
                    <div className="min-w-0 flex flex-wrap items-center gap-2">
                      <span className="text-gray-900 truncate">
                        <ResultCell a={a} />
                      </span>
                    </div>

                    {/* Col 3: Thời gian (ẩn ở mobile) */}
                    <div className="hidden md:block text-gray-800">
                      {fmtDuration(a.durationSeconds)}
                    </div>

                    {/* Col 4: Link (ẩn ở mobile, hoặc đưa xuống dưới) */}
                    <div className="hidden md:block text-right">
                      <Link
                        href={`/attempts/${a.attemptId}`}
                        className="text-blue-600 hover:underline"
                      >
                        Xem chi tiết
                      </Link>
                    </div>

                    {/* Ở mobile, hiển thị thêm hàng cho thời gian + link */}
                    <div className="md:hidden col-span-2 mt-1 flex items-center justify-between text-sm text-gray-700">
                      <span>{fmtDuration(a.durationSeconds)}</span>
                      <Link
                        href={`/attempts/${a.attemptId}`}
                        className="text-blue-600 hover:underline"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}

      {/* PAGINATION (component zero-based) */}
      {meta && meta.pages > 1 && (
        <div className="pt-4 flex justify-center">
          <Pagination
            totalPages={meta.pages}        // tổng trang
            currentPage={meta.page - 1}    // 0-based cho component
            onPageChange={(p0) => setPage(p0 + 1)} // chuyển lại 1-based cho API
            siblingCount={1}
          />
        </div>
      )}
    </div>
  );
}

