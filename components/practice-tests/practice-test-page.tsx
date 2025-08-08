'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getQuestionsByPartIds } from '@/lib/api/question';
import { getExamById } from '@/lib/api/exam';
import ToeicTest from './toeic-lr-test';
import { PartData } from '@/types/question';
import { ExamData } from '@/types/exam';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import FullPageLoader from '@/components/common/full-page-loader';

export default function TestPage() {
  const { id: testId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [examData, setExamData] = useState<ExamData | null>(null);
  const [partIds, setPartIds] = useState<string[]>([]);
  const [partNumbers, setPartNumbers] = useState<string[]>([]);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentPartData, setCurrentPartData] = useState<PartData | null>(null);

  const partDataCacheRef = useRef<Record<string, PartData>>({});
  const allAnswersRef = useRef<Record<string, Record<number, string>>>({});
  const allMarkedForReviewRef = useRef<Record<string, Record<number, boolean>>>({});

  const [loading, setLoading] = useState(true);
  const [loadingPart, setLoadingPart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [initialTime, setInitialTime] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [testFinished, setTestFinished] = useState<boolean>(false);

  // Ref để kiểm tra xem test đang trong quá trình làm bài hay không
  const isTestActiveRef = useRef(false);

  // Cập nhật trạng thái test active
  useEffect(() => {
    if (!loading && !error && !testFinished && partIds.length > 0) {
      isTestActiveRef.current = true;
    } else {
      isTestActiveRef.current = false;
    }
  }, [loading, error, testFinished, partIds.length]);

  // Hàm xử lý cảnh báo khi user muốn rời khỏi trang
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (isTestActiveRef.current) {
      e.preventDefault();
      // Thông báo chuẩn của trình duyệt
      const message = 'Bạn có chắc muốn rời khỏi trang? Tiến trình làm bài sẽ bị mất.';
      e.returnValue = message;
      return message;
    }
  }, []);

  // Hàm xử lý navigation trong Next.js router
  const handleRouteChangeStart = useCallback((url: string) => {
    if (isTestActiveRef.current) {
      const confirmLeave = window.confirm(
        'Bạn có chắc muốn rời khỏi bài test? Tất cả tiến trình làm bài sẽ bị mất và không thể khôi phục.'
      );
      if (!confirmLeave) {
        // Ngăn chặn navigation
        throw new Error('Route change cancelled by user');
      } else {
        // Cho phép navigation
        isTestActiveRef.current = false;
      }
    }
  }, [router]);

  // Hàm wrapper cho navigation an toàn
  const safeNavigate = useCallback((url: string) => {
    if (isTestActiveRef.current) {
      const confirmLeave = window.confirm(
        'Bạn có chắc muốn rời khỏi bài test? Tất cả tiến trình làm bài sẽ bị mất và không thể khôi phục.'
      );
      if (confirmLeave) {
        isTestActiveRef.current = false; // Tắt cảnh báo
        router.push(url);
      }
    } else {
      router.push(url);
    }
  }, [router]);

  // Thiết lập event listeners cho cảnh báo
  useEffect(() => {
    // Cảnh báo khi user reload trang, đóng tab, nhập URL khác
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cảnh báo khi chuyển route (cho tất cả loại navigation)
    const originalPush = router.push;
    const originalReplace = router.replace;
    const originalBack = router.back;
    
    router.push = (...args: Parameters<typeof router.push>) => {
      if (isTestActiveRef.current) {
        const confirmLeave = window.confirm(
          'Bạn có chắc muốn rời khỏi bài test? Tất cả tiến trình làm bài sẽ bị mất và không thể khôi phục.'
        );
        if (!confirmLeave) {
          return Promise.resolve(false);
        }
        isTestActiveRef.current = false;
      }
      return originalPush.apply(router, args);
    };

    router.replace = (...args: Parameters<typeof router.replace>) => {
      if (isTestActiveRef.current) {
        const confirmLeave = window.confirm(
          'Bạn có chắc muốn rời khỏi bài test? Tất cả tiến trình làm bài sẽ bị mất và không thể khôi phục.'
        );
        if (!confirmLeave) {
          return Promise.resolve(false);
        }
        isTestActiveRef.current = false;
      }
      return originalReplace.apply(router, args);
    };

    router.back = () => {
      if (isTestActiveRef.current) {
        const confirmLeave = window.confirm(
          'Bạn có chắc muốn rời khỏi bài test? Tất cả tiến trình làm bài sẽ bị mất và không thể khôi phục.'
        );
        if (!confirmLeave) {
          return;
        }
        isTestActiveRef.current = false;
      }
      return originalBack.call(router);
    };

    // Intercept all clicks on links
    const handleLinkClick = (e: MouseEvent) => {
      if (!isTestActiveRef.current) return;

      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') || target.closest('[data-href]');
      
      if (link) {
        const href = (link as HTMLAnchorElement).href || link.getAttribute('data-href');
        
        // Chỉ xử lý internal links (không có protocol hoặc same origin)
        if (href && (
          href.startsWith('/') || 
          href.startsWith('#') || 
          href.startsWith('?') ||
          href.startsWith(window.location.origin)
        )) {
          e.preventDefault();
          e.stopPropagation();
          
          const confirmLeave = window.confirm(
            'Bạn có chắc muốn rời khỏi bài test? Tất cả tiến trình làm bài sẽ bị mất và không thể khôi phục.'
          );
          
          if (confirmLeave) {
            isTestActiveRef.current = false;
            // Trigger navigation sau khi tắt cảnh báo
            setTimeout(() => {
              if (href.startsWith(window.location.origin)) {
                window.location.href = href;
              } else {
                router.push(href);
              }
            }, 0);
          }
        }
      }
    };

    // Intercept all clicks on buttons that might navigate
    const handleButtonClick = (e: MouseEvent) => {
      if (!isTestActiveRef.current) return;

      const target = e.target as HTMLElement;
      const button = target.closest('button[onclick], button[data-navigate], [role="button"][onclick]');
      
      if (button && button !== e.currentTarget) {
        const onClick = button.getAttribute('onclick');
        const navigate = button.getAttribute('data-navigate');
        
        if (onClick?.includes('router.') || onClick?.includes('navigate') || navigate) {
          e.preventDefault();
          e.stopPropagation();
          
          const confirmLeave = window.confirm(
            'Bạn có chắc muốn rời khỏi bài test? Tất cả tiến trình làm bài sẽ bị mất và không thể khôi phục.'
          );
          
          if (confirmLeave) {
            isTestActiveRef.current = false;
            // Re-trigger the click after disabling warning
            setTimeout(() => {
              (button as HTMLElement).click();
            }, 0);
          }
        }
      }
    };

    document.addEventListener('click', handleLinkClick, true);
    document.addEventListener('click', handleButtonClick, true);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      router.push = originalPush;
      router.replace = originalReplace;
      router.back = originalBack;
      document.removeEventListener('click', handleLinkClick, true);
      document.removeEventListener('click', handleButtonClick, true);
    };
  }, [handleBeforeUnload, router]);

  // Xử lý cảnh báo khi component unmount (chuyển route)
  useEffect(() => {
    return () => {
      if (isTestActiveRef.current) {
        // Component đang unmount trong khi test active
        // Không thể dùng confirm ở đây vì component đã unmount
        console.warn('Test component unmounted while test was active');
      }
    };
  }, []);

  // Override history back/forward
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isTestActiveRef.current) {
        e.preventDefault();
        const confirmLeave = window.confirm(
          'Bạn có chắc muốn rời khỏi bài test? Tất cả tiến trình làm bài sẽ bị mất và không thể khôi phục.'
        );
        if (confirmLeave) {
          isTestActiveRef.current = false;
          window.history.go(-1);
        } else {
          // Push lại state hiện tại để stay lại trang
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    // Add state để có thể handle popstate
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Set initial timer
  useEffect(() => {
    const timeParam = searchParams.get('time');
    if (!timeParam || timeParam === 'unlimited') {
      setInitialTime(0);
      setRemainingTime(0);
    } else {
      const minutes = parseInt(timeParam, 10);
      if (!Number.isNaN(minutes) && minutes > 0) {
        setInitialTime(minutes * 60);
        setRemainingTime(minutes * 60);
      } else {
        setInitialTime(0);
        setRemainingTime(0);
      }
    }
  }, [searchParams]);

  // Fetch exam + preload first part
  useEffect(() => {
    const fetchExamInfoAndFirstPart = async () => {
      try {
        setLoading(true);

        const partsParam = searchParams.get('parts');
        if (!partsParam) {
          setError('Không tìm thấy thông tin phần thi được chọn');
          return;
        }

        // Lấy dữ liệu bài thi
        const examResponse = await getExamById(parseInt(testId as string));
        const examParts = examResponse?.data?.examParts || [];
        setExamData(examResponse?.data || null);

        let chosenPartIds: string[] = [];
        let chosenPartNumbers: string[] = [];

        if (partsParam === 'all') {
          chosenPartIds = examParts.map((p: { partId: { toString: () => any; }; }) => p.partId.toString());
          chosenPartNumbers = examParts.map((p: { partNumber: { toString: () => any; }; }) => p.partNumber.toString());
        } else {
          const requestedNumbers = partsParam.split(',').filter((n) => n.trim());
          chosenPartIds = examParts
            .filter((p: { partId: { toString: () => string; }; }) => requestedNumbers.includes(p.partId.toString()))
            .map((p: { partId: { toString: () => any; }; }) => p.partId.toString());
          chosenPartNumbers = examParts
            .filter((p: { partId: { toString: () => string; }; }) => requestedNumbers.includes(p.partId.toString()))
            .map((p: { partNumber: { toString: () => any; }; }) => p.partNumber.toString());
        }

        if (!chosenPartIds.length) {
          setError('Không có phần thi nào được chọn hoặc phần thi không hợp lệ theo đề thi');
          return;
        }
 
        setPartIds(chosenPartIds);
        setPartNumbers(chosenPartNumbers);

        // Init state cho từng partId
        chosenPartIds.forEach((id) => {
          if (!allAnswersRef.current[id]) allAnswersRef.current[id] = {};
          if (!allMarkedForReviewRef.current[id]) allMarkedForReviewRef.current[id] = {};
        });

        // Preload dữ liệu cho part đầu tiên
        const firstPartId = chosenPartIds[0];
        const firstPartNumber = chosenPartNumbers[0];

        const res = await getQuestionsByPartIds({ partIds: [firstPartId] });
        if (!res?.data?.length) {
          setError(`Không tìm thấy dữ liệu cho Part ${firstPartNumber}`);
          return;
        }

        const partData = res.data[0];
        partDataCacheRef.current[firstPartId] = partData;
        setCurrentPartData(partData);

      } catch (err) {
        console.error('Error fetching exam data:', err);
        setError('Lỗi khi tải dữ liệu bài thi');
      } finally {
        setLoading(false);
      }
    };

    if (testId) fetchExamInfoAndFirstPart();
  }, [testId, searchParams]);

  // Fetch part khi chuyển (bỏ qua part đầu tiên đã được preload)
  useEffect(() => {
    if (!partIds.length || loading) return;

    const partId = partIds[currentPartIndex];

    // Kiểm tra xem part data đã có trong cache chưa
    if (partDataCacheRef.current[partId]) {
      setCurrentPartData(partDataCacheRef.current[partId]);
      return;
    }

    let cancelled = false;
    const fetchPartData = async () => {
      try {
        setLoadingPart(true);
        setIsPaused(true);
        const res = await getQuestionsByPartIds({ partIds: [partId] });
        if (cancelled) return;
        if (!res?.data?.length) {
          setError(`Không tìm thấy dữ liệu cho Part ${partId}`);
          return;
        }
        const partData = res.data[0];
        partDataCacheRef.current[partId] = partData;
        setCurrentPartData(partData);
      } catch (err) {
        console.error(err);
        setError(`Lỗi khi tải Part ${partId}`);
      } finally {
        if (!cancelled) {
          setLoadingPart(false);
          setIsPaused(false);
        }
      }
    };

    fetchPartData();
    return () => { cancelled = true; };
  }, [partIds, currentPartIndex, loading]);

  // Timer countdown
  useEffect(() => {
    if (initialTime === 0 || isPaused || testFinished || remainingTime <= 0) return;
    const t = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          setTestFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [initialTime, isPaused, remainingTime, testFinished]);

  // Handlers
  const handleNextPart = () => {
    if (currentPartIndex < partIds.length - 1) {
      setCurrentPartIndex((i) => i + 1);
    }
  }

  const handleBackToSetup = () => {
    safeNavigate(`/practice-tests/${testId}`);
  };

  const handleSubmitTest = () => {
    isTestActiveRef.current = false; // Tắt cảnh báo khi submit
    setTestFinished(true);
  };

  const updateAnswers = (partId: string, answers: Record<number, string>) => {
    allAnswersRef.current[partId] = { ...answers };
  };

  const updateMarkedForReview = (partId: string, marked: Record<number, boolean>) => {
    allMarkedForReviewRef.current[partId] = { ...marked };
  };

  // Hàm xử lý khi user click nút thoát
  const handleExitTest = () => {
    const confirmExit = window.confirm(
      "Bạn có chắc muốn thoát khỏi bài test?\n\nTất cả tiến trình làm bài sẽ bị mất và không thể khôi phục. Bạn sẽ cần bắt đầu lại từ đầu nếu muốn làm bài test này."
    );
    
    if (confirmExit) {
      isTestActiveRef.current = false; // Tắt cảnh báo
      router.push("/practice-tests");
    }
  };

  // Test finished UI
  if (testFinished) {
    const totalAnswered = Object.values(allAnswersRef.current).reduce(
      (total, partAnswers) => total + Object.keys(partAnswers).length,
      0
    );
    const totalQuestions = Object.values(partDataCacheRef.current).reduce(
      (total, partData) =>
        total +
        partData.groups.reduce(
          (groupTotal, group) => groupTotal + group.questions.length,
          0
        ),
      0
    );

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-2xl font-semibold mb-4">Test Finished</h2>
          <p className="text-gray-700 mb-2">
            {remainingTime === 0 && initialTime > 0 ? 'Time is up.' : ''}
          </p>
          <div className="text-lg font-medium mb-6">
            You answered {totalAnswered} out of {totalQuestions} questions
            {totalQuestions > 0 && (
              <span className="text-blue-600">
                ({Math.round((totalAnswered / totalQuestions) * 100)}%)
              </span>
            )}
          </div>
          <div className="space-x-4">
            <Button onClick={() => router.push('/practice-tests')}>Back to Tests</Button>
            <Button variant="outline" onClick={() => router.push('/progress')}>
              View Progress
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading UI
  if (loading) {
    return (
      <FullPageLoader/>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={handleBackToSetup} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại thiết lập bài thi
          </Button>
          <div className="text-center bg-white p-8 rounded-lg shadow">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Không thể tải bài thi
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-4">
              <Button onClick={handleBackToSetup}>Quay lại thiết lập</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setError(null);
                  setCurrentPartIndex((i) => i);
                }}
              >
                Thử lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPartId = partIds[currentPartIndex];

  return (
    <div>
      {partIds.length > 0 && (
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {examData?.examName && (
                  <span className="font-medium">{examData.examName}</span>
                )}
                {partIds.length >= 2 && (
                  <span> - Part {partNumbers[currentPartIndex]}</span>
                )}
              </div>

              {partIds.length >= 2 && (
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-1">
                    {partNumbers.map((partNumber, index) => (
                      <Button
                        key={partNumber}
                        variant={index === currentPartIndex ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPartIndex(index)}
                        disabled={loadingPart}
                        className={`min-w-[50px] h-8 text-xs ${index === currentPartIndex
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                          }`}
                      >
                        Part {partNumber}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <Button
                size="sm"
                onClick={handleExitTest}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Thoát
              </Button>
            </div>
          </div>
        </div>
      )}
      {loadingPart ? (
        <div className="text-center py-8">
          Đang tải Part {currentPartIndex + 1}...
        </div>
      ) : currentPartData ? (
        <ToeicTest
          key={currentPartId}
          partData={currentPartData}
          onPartComplete={handleNextPart}
          isLastPart={currentPartIndex === partIds.length - 1}
          currentPartIndex={currentPartIndex + 1}
          totalParts={partIds.length}
          isPaused={isPaused}
          remainingTime={remainingTime}
          onTimeChange={setRemainingTime}
          onSubmitTest={handleSubmitTest}
          initialAnswers={allAnswersRef.current[currentPartId] || {}}
          initialMarkedForReview={
            allMarkedForReviewRef.current[currentPartId] || {}
          }
          onAnswersChange={(answers) => updateAnswers(currentPartId, answers)}
          onMarkedForReviewChange={(marked) =>
            updateMarkedForReview(currentPartId, marked)
          }
        />
      ) : null}
    </div>
  );
}