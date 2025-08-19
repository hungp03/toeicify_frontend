import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getQuestionsByPartIds } from '@/lib/api/question';
import { getPublicExamById } from '@/lib/api/exam';
import { PartData } from '@/types/question';
import { ExamData } from '@/types/exam';
import { toast } from 'sonner';
import { validatePartData } from '@/lib/utils';

export const useExamData = () => {
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

  const hasShownInvalidToastRef = useRef(false);

  const handleInvalidExam = (message: string) => {
    if (hasShownInvalidToastRef.current) {
      return;
    }
    hasShownInvalidToastRef.current = true;
    toast.error(message);
    setTimeout(() => {
      router.push('/practice-tests');
    }, 2000);
  };

  // Fetch exam + preload first part
  useEffect(() => {
    const fetchExamInfoAndFirstPart = async () => {
      try {
        setLoading(true);

        const partsParam = searchParams.get("parts");
        if (!partsParam) {
          handleInvalidExam("Không tìm thấy thông tin phần thi được chọn");
          return;
        }

        // Lấy dữ liệu bài thi
        const examResponse = await getPublicExamById(parseInt(testId as string));
        let examParts = examResponse?.data?.examParts || [];

        if (!examParts.length) {
          handleInvalidExam("Bài thi không có dữ liệu phần thi");
          return;
        }

        // Sắp xếp theo partNumber tăng dần
        examParts = [...examParts].sort((a, b) => a.partNumber - b.partNumber);

        // Lưu exam data đã sort
        setExamData({ ...examResponse.data, examParts });

        let chosenPartIds: string[] = [];
        let chosenPartNumbers: string[] = [];

        if (partsParam === "all") {
          chosenPartIds = examParts.map((p: { partId: { toString: () => any; }; }) => p.partId.toString());
          chosenPartNumbers = examParts.map((p: { partNumber: { toString: () => any; }; }) => p.partNumber.toString());
        } else {
          const requestedNumbers = partsParam.split(",").filter((n) => n.trim());

          // Filter & giữ thứ tự theo examParts đã sort
          const filteredParts = examParts.filter((p: { partId: { toString: () => string; }; }) =>
            requestedNumbers.includes(p.partId.toString())
          );

          chosenPartIds = filteredParts.map((p: { partId: { toString: () => any; }; }) => p.partId.toString());
          chosenPartNumbers = filteredParts.map((p: { partNumber: { toString: () => any; }; }) => p.partNumber.toString());
        }

        if (!chosenPartIds.length) {
          handleInvalidExam("Không tìm thấy phần thi được yêu cầu");
          return;
        }

        setPartIds(chosenPartIds);
        setPartNumbers(chosenPartNumbers);

        // Init state cho từng partId
        chosenPartIds.forEach((id) => {
          if (!allAnswersRef.current[id]) allAnswersRef.current[id] = {};
          if (!allMarkedForReviewRef.current[id]) allMarkedForReviewRef.current[id] = {};
        });

        // Load part đầu tiên
        const firstPartId = chosenPartIds[0];
        const res = await getQuestionsByPartIds({ partIds: [firstPartId] });

        if (!res?.data?.length) {
          handleInvalidExam(`Không tìm thấy dữ liệu cho Part ${chosenPartNumbers[0]}`);
          return;
        }

        const partData = res.data[0];
        if (!validatePartData(partData)) {
          handleInvalidExam(
            `Part ${chosenPartNumbers[0]} không có câu hỏi nào. Vui lòng kiểm tra lại đề thi.`
          );
          return;
        }

        partDataCacheRef.current[firstPartId] = partData;
        setCurrentPartData(partData);
      } catch (err) {
        console.error("Error fetching exam data:", err);
        handleInvalidExam("Lỗi khi tải dữ liệu bài thi. Vui lòng thử lại sau.");
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
        const res = await getQuestionsByPartIds({ partIds: [partId] });
        if (cancelled) return;

        if (!res?.data?.length) {
          handleInvalidExam(`Không tìm thấy dữ liệu cho Part ${partNumbers[currentPartIndex]}`);
          return;
        }

        const partData = res.data[0];

        // Validate part data có câu hỏi hay không
        if (!validatePartData(partData)) {
          handleInvalidExam(`Part ${partNumbers[currentPartIndex]} không có câu hỏi nào. Vui lòng kiểm tra lại đề thi.`);
          return;
        }

        partDataCacheRef.current[partId] = partData;
        setCurrentPartData(partData);
      } catch (err) {
        console.error(err);
        handleInvalidExam(`Lỗi khi tải Part ${partNumbers[currentPartIndex]}. Vui lòng thử lại sau.`);
      } finally {
        if (!cancelled) {
          setLoadingPart(false);
        }
      }
    };

    fetchPartData();
    return () => { cancelled = true; };
  }, [partIds, currentPartIndex, loading]);

  const updateAnswers = (partId: string, answers: Record<number, string>) => {
    allAnswersRef.current[partId] = { ...answers };
  };

  const updateMarkedForReview = (partId: string, marked: Record<number, boolean>) => {
    allMarkedForReviewRef.current[partId] = { ...marked };
  };

  const handleNextPart = () => {
    if (currentPartIndex < partIds.length - 1) {
      setCurrentPartIndex((i) => i + 1);
    }
  };

  return {
    examData,
    partIds,
    partNumbers,
    currentPartIndex,
    currentPartData,
    loading,
    loadingPart,
    error,
    allAnswersRef,
    allMarkedForReviewRef,
    partDataCacheRef,
    setCurrentPartIndex,
    setError,
    updateAnswers,
    updateMarkedForReview,
    handleNextPart
  };
};