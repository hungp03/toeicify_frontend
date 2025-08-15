import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { createQuestionGroup } from "@/lib/api/question";
import { QuestionGroupRequest, QuestionType, PartRule, AddQuestionGroupDialogProps, QuestionRequest } from "@/types/question";
import { MediaUploader } from "@/components/common/media_uploader";

/** Mốc bắt đầu & số lượng cho TOEIC truyền thống */
const TOEIC_PART_START: Record<number, number> = {
  1: 1,   // 1–6
  2: 7,   // 7–31
  3: 32,  // 32–70
  4: 71,  // 71–100
  5: 101, // 101–130
  6: 131, // 131–146
  7: 147, // 147–200
};
const TOEIC_PART_LENGTH: Record<number, number> = {
  1: 6,
  2: 25,
  3: 39,
  4: 30,
  5: 30,
  6: 16,
  7: 54,
};

const PART_RULES: Record<number, PartRule> = {
  1: {
    displayName: "Part 1 - Photos",
    questionsPerGroup: 1,
    optionLetters: ["A", "B", "C", "D"],
    showImage: true,
    showAudio: true,
    showPassage: true,
    defaultQuestionType: "LISTENING_PHOTO",
    requireQuestionText: false,
  },
  2: {
    displayName: "Part 2 - Question-Response",
    questionsPerGroup: 1,
    optionLetters: ["A", "B", "C"], // exactly 3 options
    showImage: false,
    showAudio: true,
    showPassage: true,
    defaultQuestionType: "LISTENING_QUESTION_RESPONSE",
    requireQuestionText: false,
  },
  3: {
    displayName: "Part 3 - Conversations",
    questionsPerGroup: 3,
    optionLetters: ["A", "B", "C", "D"],
    showImage: true,
    showAudio: true,
    showPassage: true,
    defaultQuestionType: "LISTENING_CONVERSATION",
    requireQuestionText: true,
  },
  4: {
    displayName: "Part 4 - Talks",
    questionsPerGroup: 3,
    optionLetters: ["A", "B", "C", "D"],
    showImage: true,
    showAudio: true,
    showPassage: true,
    defaultQuestionType: "LISTENING_TALK",
    requireQuestionText: true,
  },
  5: {
    displayName: "Part 5 - Incomplete Sentences",
    questionsPerGroup: 1,
    optionLetters: ["A", "B", "C", "D"],
    showImage: false,
    showAudio: false,
    showPassage: false,
    defaultQuestionType: "READING_INCOMPLETE_SENTENCES",
    requireQuestionText: true,
  },
  6: {
    displayName: "Part 6 - Text Completion",
    questionsPerGroup: 4, // a set often has 4 blanks
    optionLetters: ["A", "B", "C", "D"],
    showImage: true,
    showAudio: false,
    showPassage: true,
    defaultQuestionType: "READING_TEXT_COMPLETION",
    requireQuestionText: true,
  },
  7: {
    displayName: "Part 7 - Reading Comprehension",
    questionsPerGroup: 5, // baseline; overridden by passage mode below
    optionLetters: ["A", "B", "C", "D"],
    showImage: true,
    showAudio: false,
    showPassage: true,
    defaultQuestionType: "READING_SINGLE_PASSAGE", // can be switched in UI
    requireQuestionText: true,
  },
};

const DEFAULT_SINGLE_MIN = 2; // allow 2-4 Qs for single passage
const DEFAULT_SINGLE_MAX = 4;
const DOUBLE_TRIPLE_COUNT = 5; // fixed 5 Qs per set for double/triple

const questionTypeForPart = (partNumber: number, overrideForP7?: QuestionType): QuestionType => {
  if (partNumber === 7 && overrideForP7) return overrideForP7;
  return PART_RULES[partNumber]?.defaultQuestionType ?? "READING_SINGLE_PASSAGE";
};

const FieldHint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-muted-foreground mt-1">{children}</p>
);

export const QuestionAddGroupDialog: React.FC<AddQuestionGroupDialogProps> = ({
  open,
  onOpenChange,
  partId,
  partNumber,
  onCreated,
  existingNumbers = [], // tất cả số đã dùng trong PART này
}) => {
  const baseRules: PartRule | undefined = useMemo(
    () => (partNumber ? PART_RULES[partNumber] : undefined),
    [partNumber]
  );

  const [p7Mode, setP7Mode] = useState<QuestionType>("READING_SINGLE_PASSAGE");

  // group-level fields
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [passageText, setPassageText] = useState("");

  // numbering
  const [autoNumber, setAutoNumber] = useState(true);

  const usedSet = useMemo(
    () => new Set((existingNumbers || []).filter((n) => Number.isFinite(n))),
    [existingNumbers]
  );

  // TÍNH MỐC BẮT ĐẦU: nếu part đã có số → max+1; nếu chưa → mốc TOEIC
  const computedStart = useMemo(() => {
    if (!partNumber) return 1;
    if (existingNumbers.length) return Math.max(...existingNumbers) + 1;
    return TOEIC_PART_START[partNumber] ?? 1;
  }, [existingNumbers, partNumber]);

  const partRange = useMemo(() => {
    if (!partNumber) return { start: 1, end: 10_000 };
    const start = TOEIC_PART_START[partNumber] ?? 1;
    const len = TOEIC_PART_LENGTH[partNumber] ?? 10_000;
    return { start, end: start + len - 1 };
  }, [partNumber]);

  const [baseNumber, setBaseNumber] = useState<number>(computedStart);

  type UIQuestion = {
    questionNumber: string;
    questionText: string;
    correctAnswerOption: "A" | "B" | "C" | "D";
    explanation: string;
    options: Record<"A" | "B" | "C" | "D", string>;
  };

  const makeEmptyQuestion = (letters: ("A" | "B" | "C" | "D")[]): UIQuestion => ({
    questionNumber: "",
    questionText: "",
    correctAnswerOption: (letters[0] ?? "A"),
    explanation: "",
    options: (["A","B","C","D"] as const).reduce((acc, L) => {
      if (letters.includes(L)) acc[L] = "";
      return acc;
    }, {} as Record<"A"|"B"|"C"|"D", string>),
  });

  const initialQuestions = (rules?: PartRule, mode?: QuestionType): UIQuestion[] => {
    if (!rules) return [];
    const letters = rules.optionLetters as ("A"|"B"|"C"|"D")[];
    const count =
      partNumber === 7
        ? (mode === "READING_SINGLE_PASSAGE" ? DEFAULT_SINGLE_MIN : DOUBLE_TRIPLE_COUNT)
        : rules.questionsPerGroup;
    return Array.from({ length: count }, () => makeEmptyQuestion(letters));
  };

  const [questions, setQuestions] = useState<UIQuestion[]>(initialQuestions(baseRules, p7Mode));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // reset theo open/part/mode
  useEffect(() => {
    if (!open) return;
    setImageUrl("");
    setAudioUrl("");
    setPassageText("");
    setQuestions(initialQuestions(baseRules, p7Mode));
    setAutoNumber(true);
    setError(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, partNumber, p7Mode]);

  // cập nhật base khi computedStart đổi
  useEffect(() => {
    setBaseNumber(computedStart);
  }, [computedStart]);

  // auto-fill số khi autoNumber/base/length đổi
  useEffect(() => {
    if (!autoNumber) return;
    setQuestions((prev) =>
      prev.map((q, i) => ({ ...q, questionNumber: String(baseNumber + i) }))
    );
  }, [autoNumber, baseNumber, questions.length]);

  if (!baseRules || !partId || !partNumber) {
    return null;
  }

  const optionLetters = baseRules.optionLetters as ("A"|"B"|"C"|"D")[];

  const onChangeQuestionField = (idx: number, field: keyof UIQuestion, value: string) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));
  };

  const onChangeOption = (idx: number, letter: "A" | "B" | "C" | "D", text: string) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, options: { ...q.options, [letter]: text } } : q)));
  };

  const canAddP7Single =
    partNumber === 7 &&
    p7Mode === "READING_SINGLE_PASSAGE" &&
    questions.length < DEFAULT_SINGLE_MAX;

  const canRemoveP7Single =
    partNumber === 7 &&
    p7Mode === "READING_SINGLE_PASSAGE" &&
    questions.length > DEFAULT_SINGLE_MIN;

  const addQuestionP7Single = () => {
    if (!canAddP7Single) return;
    setQuestions((prev) => [...prev, makeEmptyQuestion(optionLetters)]);
  };

  const removeQuestionP7Single = (index?: number) => {
    if (!canRemoveP7Single) return;
    setQuestions((prev) => prev.filter((_, i) => (index == null ? i !== prev.length - 1 : i !== index)));
  };

  /** Validate số khi ở manual mode */
  const numberErrors = useMemo(() => {
    if (autoNumber) {
      // kiểm tra tràn phạm vi khi auto
      const last = baseNumber + (questions.length - 1);
      if (last > partRange.end) {
        return `Vượt phạm vi Part ${partNumber}. Phạm vi cho part này: ${partRange.start}–${partRange.end}.`;
      }
      // không cần check trùng vì auto luôn liên tiếp từ baseNumber; chỉ cần tránh đè số đã dùng
      for (let i = 0; i < questions.length; i++) {
        const n = baseNumber + i;
        if (usedSet.has(n)) {
          return `Số ${n} đã tồn tại trong phần thi này. Chỉnh "Base number" để tránh trùng.`;
        }
      }
      return null;
    }

    const nums = questions.map((q) => Number((q.questionNumber ?? "").trim()));
    for (let i = 0; i < nums.length; i++) {
      const n = nums[i];
      if (!Number.isInteger(n) || n <= 0) return `Câu ${i + 1}: "Question number" phải là số nguyên dương.`;
      if (n < partRange.start || n > partRange.end) {
        return `Câu ${i + 1}: số phải nằm trong phạm vi ${partRange.start}–${partRange.end} của Part ${partNumber}.`;
      }
    }
    const dup = new Set<number>();
    for (const n of nums) {
      if (dup.has(n)) return `Trùng "Question number": ${n}.`;
      dup.add(n);
    }
    for (const n of nums) {
      if (usedSet.has(n)) return `Số ${n} đã tồn tại trong phần thi này.`;
    }
    const sorted = [...nums].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== sorted[i - 1] + 1) {
        return `Các số phải LIÊN TIẾP trong group. Ví dụ: ${sorted[0]}, ${sorted[0] + 1}, ${sorted[0] + 2}...`;
      }
    }
    return null;
  }, [autoNumber, baseNumber, questions.length, questions, usedSet, partRange, partNumber]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (partNumber === 7) {
        const hasImage = !!imageUrl?.trim();
        const hasPassage = !!passageText?.trim();
        if (!hasImage && !hasPassage) {
          throw new Error("Part 7: cần ít nhất một trong hai: Image URL hoặc Passage/Context.");
        }
      }

      if (numberErrors) throw new Error(numberErrors);

      // text/options
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (baseRules.requireQuestionText && !q.questionText.trim()) {
          throw new Error(`Câu ${i + 1}: thiếu phần "Question".`);
        }
        for (const L of optionLetters) {
          if (!q.options[L]?.trim()) throw new Error(`Câu ${i + 1}: đáp án ${L} chưa có nội dung.`);
        }
      }

      const qType = questionTypeForPart(partNumber, partNumber === 7 ? p7Mode : undefined);

      const payload: QuestionGroupRequest = {
        partId,
        passageText: baseRules.showPassage && passageText ? passageText : undefined,
        imageUrl: baseRules.showImage && imageUrl ? imageUrl : undefined,
        audioUrl: baseRules.showAudio && audioUrl ? audioUrl : undefined,
        questions: questions.map<QuestionRequest>((q, i) => ({
          questionNumber: Number(q.questionNumber || (baseNumber + i)),
          questionText: baseRules.requireQuestionText ? (q.questionText || undefined) : (q.questionText || undefined),
          questionType: qType,
          correctAnswerOption: q.correctAnswerOption,
          explanation: q.explanation || undefined,
          options: optionLetters.map((L) => ({
            optionLetter: L,
            optionText: q.options[L] || "",
          })),
        })),
      };

      await createQuestionGroup(payload);
      onOpenChange(false);
      onCreated?.();
    } catch (e: any) {
      setError(e?.message || "Không thể tạo nhóm câu hỏi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[60vw] !w-[60vw] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Thêm question group — {baseRules.displayName}</DialogTitle>
          <DialogDescription>Bám sát cấu trúc TOEIC.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">
          {/* (Giữ selector Part 7 nếu có) */}

          {/* Numbering controller */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="flex items-center gap-2">
              {/* <input id="autoNumber" type="checkbox" checked={autoNumber} onChange={(e) => setAutoNumber(e.target.checked)} /> */}
              {/* <Label htmlFor="autoNumber">Tự động đánh số</Label> */}
            </div>
            <div className="sm:col-span-2 flex items-end gap-3">
              <div className="flex-1">
                {/* <Label>Base number</Label>
                <Input
                  type="number"
                  min={partRange.start}
                  max={partRange.end}
                  value={baseNumber}
                  disabled={!autoNumber}
                  onChange={(e) => {
                    const v = Number(e.target.value || partRange.start);
                    setBaseNumber(Math.min(partRange.end, Math.max(partRange.start, v)));
                  }}
                /> */}
                <span>Base number: {baseNumber}</span>
                <FieldHint>
                  Mặc định: {computedStart}. Phạm vi Part {partNumber}: {partRange.start}–{partRange.end}.
                </FieldHint>
              </div>
            </div>
          </div>

          {/* Media group */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {baseRules.showImage && (
                <MediaUploader label="Image" value={imageUrl} onChange={setImageUrl} accept="image/*" folder="images" placeholder="Dán URL ảnh hoặc tải lên" hint="Hỗ trợ PNG, JPG, GIF, WEBP, BMP" preview="image" />
              )}
              {baseRules.showAudio && (
                <MediaUploader label="Audio" value={audioUrl} onChange={setAudioUrl} accept="audio/*" folder="audios" placeholder="Dán URL audio hoặc tải lên" hint="Hỗ trợ MP3, WAV, OGG, MP4, WEBM" preview="audio" />
              )}
            </div>

            {baseRules.showPassage && (
              <div>
                <Label htmlFor="passageText">Passage / Context</Label>
                <Textarea id="passageText" rows={4} placeholder="Nhập đoạn văn hoặc ngữ cảnh" value={passageText} onChange={(e) => setPassageText(e.target.value)} />
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Questions */}
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Question {idx + 1}</Badge>
                  </div>
                  {partNumber === 7 && p7Mode === "READING_SINGLE_PASSAGE" && questions.length > DEFAULT_SINGLE_MIN && (
                    <Button type="button" variant="ghost" onClick={() => removeQuestionP7Single(idx)} className="h-8 px-2 text-xs">
                      Xoá câu này
                    </Button>
                  )}
                </div>

                <div className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label>Question number</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={partRange.start}
                      max={partRange.end}
                      placeholder={`VD: ${computedStart}`}
                      value={q.questionNumber}
                      onChange={(e) => {
                        if (autoNumber) return;
                        onChangeQuestionField(idx, "questionNumber", e.target.value);
                      }}
                      readOnly={autoNumber}
                      className={cn(autoNumber && "bg-gray-50")}
                      title={autoNumber ? "Đang ở chế độ tự động" : undefined}
                    />
                    <FieldHint>
                      {autoNumber
                        ? `Tự động: ${baseNumber + idx}`
                        : `Trong phạm vi ${partRange.start}–${partRange.end}, liên tiếp, không trùng số đã có.`}
                    </FieldHint>
                  </div>

                  <div className="sm:col-span-2">
                    {baseRules.requireQuestionText && (
                      <>
                        <Label>Question</Label>
                        <Textarea rows={2} placeholder="Nhập nội dung câu hỏi" value={q.questionText} onChange={(e) => onChangeQuestionField(idx, "questionText", e.target.value)} />
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  { (baseRules.optionLetters as ("A"|"B"|"C"|"D")[]).map((L) => (
                    <div key={L} className="space-y-1">
                      <Label>Option {L}</Label>
                      <Input placeholder={`Nội dung đáp án ${L}`} value={q.options[L] || ""} onChange={(e) => onChangeOption(idx, L, e.target.value)} />
                    </div>
                  )) }
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <Label>Đáp án đúng</Label>
                    <select
                      className={cn("w-full rounded-md border bg-background px-3 py-2 text-sm", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")}
                      value={q.correctAnswerOption}
                      onChange={(e) => onChangeQuestionField(idx, "correctAnswerOption", e.target.value)}
                    >
                      {(baseRules.optionLetters as ("A"|"B"|"C"|"D")[]).map((L) => (
                        <option key={L} value={L}>{L}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Giải thích (tuỳ chọn)</Label>
                    <Input placeholder="Giải thích ngắn gọn" value={q.explanation} onChange={(e) => onChangeQuestionField(idx, "explanation", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(error || numberErrors) && (
            <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error || numberErrors}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={submitting}>Huỷ</Button>
          <Button onClick={handleSubmit} disabled={submitting || !!numberErrors}>
            {submitting ? "Đang tạo..." : "Tạo question group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};