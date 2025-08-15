import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { updateQuestionGroup as apiUpdateQuestionGroup } from "@/lib/api/question"; // PUT /question-groups/{id}
import type {
  QuestionType,
  QuestionResponse,
  QuestionOptionResponse,
  PartRuleUpdate,
  EditQuestionGroupDialogProps,
  UIOption,
  UIQuestion
} from "@/types/question";
import { MediaUploader } from "@/components/common/media_uploader";

/** ---------- Part rules (khớp TOEIC + yêu cầu tuỳ biến) ---------- */
const PART_RULES: Record<number, PartRuleUpdate> = {
  1: { displayName: "Part 1 - Photos", defaultQuestionsPerGroup: 1, optionLetters: ["A","B","C","D"], showImage: true,  showAudio: true,  showPassage: true,  defaultQuestionType: "LISTENING_PHOTO",            requireQuestionText: false },
  2: { displayName: "Part 2 - Question-Response", defaultQuestionsPerGroup: 1, optionLetters: ["A","B","C"],     showImage: false, showAudio: true,  showPassage: false, defaultQuestionType: "LISTENING_QUESTION_RESPONSE", requireQuestionText: false },
  3: { displayName: "Part 3 - Conversations", defaultQuestionsPerGroup: 3, optionLetters: ["A","B","C","D"], showImage: true,  showAudio: true,  showPassage: true,  defaultQuestionType: "LISTENING_CONVERSATION",    requireQuestionText: true },
  4: { displayName: "Part 4 - Talks", defaultQuestionsPerGroup: 3, optionLetters: ["A","B","C","D"], showImage: true, showAudio: true,  showPassage: true,  defaultQuestionType: "LISTENING_TALK",              requireQuestionText: true },
  5: { displayName: "Part 5 - Incomplete Sentences", defaultQuestionsPerGroup: 1, optionLetters: ["A","B","C","D"], showImage: false, showAudio: false, showPassage: false, defaultQuestionType: "READING_INCOMPLETE_SENTENCES", requireQuestionText: true },
  6: { displayName: "Part 6 - Text Completion", defaultQuestionsPerGroup: 4, optionLetters: ["A","B","C","D"], showImage: true,  showAudio: false, showPassage: true,  defaultQuestionType: "READING_TEXT_COMPLETION",   requireQuestionText: true },
  7: { displayName: "Part 7 - Reading Comprehension", defaultQuestionsPerGroup: 5, optionLetters: ["A","B","C","D"], showImage: true,  showAudio: false, showPassage: true,  defaultQuestionType: "READING_SINGLE_PASSAGE",     requireQuestionText: true },
};

const DEFAULT_SINGLE_MIN = 2; // P7 single: 2–4
const DEFAULT_SINGLE_MAX = 4;
const DOUBLE_TRIPLE_COUNT = 5; // P7 double/triple: 5 câu

/** ---------- Helpers ---------- */
const FieldHint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-muted-foreground mt-1">{children}</p>
);

const LETTER_ORDER = ["A","B","C","D"] as const;
const sortByLetter = (a: string, b: string) => LETTER_ORDER.indexOf(a as any) - LETTER_ORDER.indexOf(b as any);

const detectP7ModeFromQuestions = (qs: QuestionResponse[]): QuestionType => {
  const t = qs[0]?.questionType || "READING_SINGLE_PASSAGE";
  if (t === "READING_DOUBLE_PASSAGE" || t === "READING_TRIPLE_PASSAGE") return t;
  return "READING_SINGLE_PASSAGE";
};

const questionTypeForPart = (partNumber: number, p7Override?: QuestionType): QuestionType => {
  if (partNumber === 7 && p7Override) return p7Override;
  return PART_RULES[partNumber]?.defaultQuestionType ?? "READING_SINGLE_PASSAGE";
};

export function QuestionEditGroupDialog({
  open,
  onOpenChange,
  group,
  partNumber,
  partId,
  onUpdated,
}: EditQuestionGroupDialogProps) {
  const rules = useMemo(() => (partNumber ? PART_RULES[partNumber] : undefined), [partNumber]);

  // P7 mode: single/double/triple (áp dụng cho cả group)
  const [p7Mode, setP7Mode] = useState<QuestionType>("READING_SINGLE_PASSAGE");

  // Group fields
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [passageText, setPassageText] = useState("");

  // Questions UI state
  const [questions, setQuestions] = useState<UIQuestion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate when open/group changes
  useEffect(() => {
    if (!open || !group || !rules || !partNumber) return;

    // Set group level
    setImageUrl(group.imageUrl || "");
    setAudioUrl(group.audioUrl || "");
    setPassageText(group.passageText || "");

    // Detect P7 mode from existing data
    if (partNumber === 7) {
      setP7Mode(detectP7ModeFromQuestions(group.questions));
    }

    // Build UI questions
    const expectLetters = (rules.optionLetters as string[]).sort(sortByLetter) as ("A"|"B"|"C"|"D")[];

    const uiQs: UIQuestion[] = group.questions.map((q: QuestionResponse) => {
      // Map existing options to by-letter
      const byLetter: Record<"A"|"B"|"C"|"D", UIOption | undefined> = { A: undefined, B: undefined, C: undefined, D: undefined };
      // Keep only expected letters for the part (e.g., Part 2: A,B,C)
      (q.options || []).forEach((opt: QuestionOptionResponse) => {
        const letter = opt.optionLetter as "A"|"B"|"C"|"D";
        if (expectLetters.includes(letter)) {
          byLetter[letter] = { optionId: opt.optionId, letter, text: opt.optionText };
        }
      });
      // Ensure all expected letters exist (init empty text if missing)
      expectLetters.forEach((L) => {
        if (!byLetter[L]) byLetter[L] = { letter: L, text: "" };
      });

      return {
        questionId: q.questionId,
        questionNumber: q.questionNumber, // Added
        questionText: q.questionText || "",
        correctAnswerOption: q.correctAnswerOption || expectLetters[0],
        explanation: q.explanation || "",
        options: byLetter,
      };
    });

    // Part 7 single: clamp to 2–4; Double/Triple: fix 5
    if (partNumber === 7) {
      if (p7Mode === "READING_SINGLE_PASSAGE") {
        const fixed = uiQs.slice(0, DEFAULT_SINGLE_MAX);
        while (fixed.length < DEFAULT_SINGLE_MIN) {
          fixed.push(makeEmptyQuestion(expectLetters));
        }
        setQuestions(fixed);
      } else {
        const count = DOUBLE_TRIPLE_COUNT;
        const fixed = uiQs.slice(0, count);
        while (fixed.length < count) fixed.push(makeEmptyQuestion(expectLetters));
        setQuestions(fixed);
      }
    } else {
      setQuestions(uiQs);
    }

    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, group, partNumber, rules, p7Mode]);

  const makeEmptyQuestion = (letters: ("A"|"B"|"C"|"D")[]): UIQuestion => ({
    questionNumber: questions.length > 0 ? Math.max(...questions.map(q => q.questionNumber || 0)) + 1 : 1, // Auto-increment
    questionText: "",
    correctAnswerOption: letters[0] || "A",
    explanation: "",
    options: {
      A: letters.includes("A") ? { letter: "A", text: "" } : undefined,
      B: letters.includes("B") ? { letter: "B", text: "" } : undefined,
      C: letters.includes("C") ? { letter: "C", text: "" } : undefined,
      D: letters.includes("D") ? { letter: "D", text: "" } : undefined,
    },
  });

  if (!open) return null;
  if (!rules || !group || !partNumber || !partId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa question group</DialogTitle>
            <DialogDescription>Thiếu dữ liệu part hoặc group.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const optionLetters = (rules.optionLetters as string[]).sort(sortByLetter) as ("A"|"B"|"C"|"D")[];

  const onChangeQuestionField = (idx: number, field: keyof UIQuestion, value: string | number) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));
  };

  const onChangeOption = (idx: number, letter: "A"|"B"|"C"|"D", text: string) => {
    if (!optionLetters.includes(letter)) return;
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === idx
          ? { ...q, options: { ...q.options, [letter]: q.options[letter] ? { ...q.options[letter]!, text } : { letter, text } } }
          : q
      )
    );
  };

  // P7 controls
  const isP7Single = partNumber === 7 && p7Mode === "READING_SINGLE_PASSAGE";
  const canAddP7Single = isP7Single && questions.length < DEFAULT_SINGLE_MAX;
  const canRemoveP7Single = isP7Single && questions.length > DEFAULT_SINGLE_MIN;
  const addQuestionP7Single = () => {
    if (!canAddP7Single) return;
    setQuestions((prev) => [...prev, makeEmptyQuestion(optionLetters)]);
  };
  const removeQuestionP7Single = (index?: number) => {
    if (!canRemoveP7Single) return;
    setQuestions((prev) => prev.filter((_, i) => (index == null ? i !== prev.length - 1 : i !== index)));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Ràng buộc Part 7: phải có ÍT NHẤT một trong hai — imageUrl hoặc passageText
      if (partNumber === 7) {
        const hasImage = !!imageUrl?.trim();
        const hasPassage = !!passageText?.trim();
        if (!hasImage && !hasPassage) {
          throw new Error("Part 7: cần có ít nhất một trong hai: Image URL hoặc Passage/Context.");
        }
      }

      // Determine question type
      const qType = questionTypeForPart(partNumber, partNumber === 7 ? p7Mode : undefined);

      // Build payload for PUT
      const payload: any /* QuestionGroupRequest with IDs for update */ = {
        partId,
        passageText: rules.showPassage && passageText ? passageText : undefined,
        imageUrl: rules.showImage && imageUrl ? imageUrl : undefined,
        audioUrl: rules.showAudio && audioUrl ? audioUrl : undefined,
        questions: questions.map((q) => {
          const opts = optionLetters.map((L) => {
            const ui = q.options[L];
            return {
              optionId: ui?.optionId,           // giữ id nếu có
              optionLetter: L,
              optionText: ui?.text || "",
            };
          });
          return {
            questionId: q.questionId,           // giữ id nếu có 
            questionNumber: q.questionNumber,   // Added
            questionText: (partNumber === 1 || partNumber === 2) ? passageText : (rules.requireQuestionText ? (q.questionText || undefined) : (q.questionText || undefined)),
            questionType: qType,
            correctAnswerOption: q.correctAnswerOption,
            explanation: q.explanation || undefined,
            options: opts,
          };
        }),
      };

      // Client-side validations
      for (let i = 0; i < payload.questions.length; i++) {
        const qq = payload.questions[i];
        if (!qq.questionNumber) {
          throw new Error(`Câu ${i + 1}: thiếu số thứ tự câu hỏi.`);
        }
        if (rules.requireQuestionText && !(partNumber === 1 || partNumber === 2)) {
          if (!qq.questionText?.trim()) throw new Error(`Câu ${i + 1}: thiếu nội dung câu hỏi.`);
        }
        const valid = new Set(optionLetters);
        if (!valid.has(qq.correctAnswerOption)) {
          throw new Error(`Câu ${i + 1}: đáp án đúng phải nằm trong ${Array.from(valid).join(", ")}.`);
        }
        for (const opt of qq.options) {
          if (!opt.optionText?.trim()) throw new Error(`Câu ${i + 1}: đáp án ${opt.optionLetter} chưa có nội dung.`);
        }
      }

      await apiUpdateQuestionGroup(group.groupId, payload);
      onOpenChange(false);
      onUpdated?.();
    } catch (e: any) {
      setError(e?.message || "Không thể cập nhật nhóm câu hỏi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[60vw] !w-[60vw] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Chỉnh sửa question group — {rules.displayName}</DialogTitle>
          <DialogDescription>Sửa dữ liệu theo đúng định dạng TOEIC.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">
          {/* Part 7: chọn passage mode */}
          {partNumber === 7 && (
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2">
                <Label>Loại passage (áp dụng cho toàn group)</Label>
                <select
                  className={cn(
                    "w-full rounded-md border bg-background px-3 py-2 text-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  value={p7Mode}
                  onChange={(e) => setP7Mode(e.target.value as QuestionType)}
                >
                  <option value="READING_SINGLE_PASSAGE">Single passage (2–4 câu)</option>
                  <option value="READING_DOUBLE_PASSAGE">Double passage (5 câu)</option>
                  <option value="READING_TRIPLE_PASSAGE">Triple passage (5 câu)</option>
                </select>
                <FieldHint>
                  Single: tối thiểu {DEFAULT_SINGLE_MIN}, tối đa {DEFAULT_SINGLE_MAX}. Double/Triple: cố định {DOUBLE_TRIPLE_COUNT}.
                </FieldHint>
              </div>
              {p7Mode === "READING_SINGLE_PASSAGE" && (
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" disabled={!canRemoveP7Single} onClick={() => removeQuestionP7Single()}>
                    Bớt 1 câu
                  </Button>
                  <Button type="button" disabled={!canAddP7Single} onClick={addQuestionP7Single}>
                    Thêm 1 câu
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Group fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rules.showImage && (
                <div>
                  <MediaUploader
                    label="Image"
                    value={imageUrl}
                    onChange={setImageUrl}
                    accept="image/*"
                    folder="images"                              
                    placeholder="Dán URL ảnh hoặc tải lên"
                    hint="Hỗ trợ PNG, JPG, GIF, WEBP, BMP"
                    preview="image"
                  />
                </div>
              )}
              {rules.showAudio && (
                <div>
                  <MediaUploader
                    label="Audio"
                    value={audioUrl}
                    onChange={setAudioUrl}
                    accept="audio/*"
                    folder="audios"                              
                    placeholder="Dán URL audio hoặc tải lên"
                    hint="Hỗ trợ MP3, WAV, OGG, MP4, WEBM"
                    preview="audio"
                  />
                </div>
              )}
            </div>
            {rules.showPassage && (
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
              <div key={q.questionId ?? `new-${idx}`} className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Question {idx + 1}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Type: <span className="font-medium">{questionTypeForPart(partNumber, partNumber === 7 ? p7Mode : undefined)}</span>
                    </span>
                  </div>
                  {isP7Single && questions.length > DEFAULT_SINGLE_MIN && (
                    <Button type="button" variant="ghost" onClick={() => removeQuestionP7Single(idx)} className="h-8 px-2 text-xs">
                      Xoá câu này
                    </Button>
                  )}
                </div>

                {/* Question number */}
                <div className="mb-3">
                  <Label>Số thứ tự câu hỏi</Label>
                  <Input
                    type="number"
                    placeholder="Nhập số thứ tự câu hỏi"
                    value={q.questionNumber || ""}
                    onChange={(e) =>
                      onChangeQuestionField(
                        idx,
                        "questionNumber",
                        isNaN(parseInt(e.target.value)) ? "" : parseInt(e.target.value)
                      )
                    }
                  />
                </div>

                {/* Question text (ẩn hoàn toàn ở Part 1 & 2) */}
                {!(partNumber === 1 || partNumber === 2) && (
                  <div className="mb-3">
                    <Label>Question</Label>
                    <Textarea rows={2} placeholder="Nhập nội dung câu hỏi" value={q.questionText} onChange={(e) => onChangeQuestionField(idx, "questionText", e.target.value)} />
                  </div>
                )}

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {optionLetters.map((L) => (
                    <div key={L} className="space-y-1">
                      <Label>Option {L}</Label>
                      <Input
                        placeholder={`Nội dung đáp án ${L}`}
                        value={q.options[L]?.text || ""}
                        onChange={(e) => onChangeOption(idx, L, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                {/* Correct answer + explanation */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <Label>Đáp án đúng</Label>
                    <select
                      className={cn("w-full rounded-md border bg-background px-3 py-2 text-sm", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")}
                      value={q.correctAnswerOption}
                      onChange={(e) => onChangeQuestionField(idx, "correctAnswerOption", e.target.value)}
                    >
                      {optionLetters.map((L) => (
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

          {error && <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={submitting}>Huỷ</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Đang lưu..." : "Lưu thay đổi"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}