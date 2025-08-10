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
import { QuestionGroupRequest, QuestionType, PartRule, AddQuestionGroupDialogProps } from "@/types/question";
import { MediaUploader } from "@/components/common/media_uploader";

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
    showPassage: false,
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
    showImage: false,
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
}) => {
  const baseRules: PartRule | undefined = useMemo(
    () => (partNumber ? PART_RULES[partNumber] : undefined),
    [partNumber]
  );

  // Part 7: passage mode selector (single/double/triple)
  const [p7Mode, setP7Mode] = useState<QuestionType>("READING_SINGLE_PASSAGE");

  // Group-level fields
  const [imageUrl, setImageUrl] = useState<string>(""); 
const [audioUrl, setAudioUrl] = useState<string>("");
  const [passageText, setPassageText] = useState("");

  // Questions UI state
  type UIQuestion = {
    questionText: string;
    correctAnswerOption: string;
    explanation: string;
    options: Record<string, string>; // {A: "", B: "", ...}
  };

  const makeEmptyQuestion = (letters: string[]): UIQuestion => ({
    questionText: "",
    correctAnswerOption: letters[0] || "A",
    explanation: "",
    options: letters.reduce<Record<string, string>>((acc, L) => {
      acc[L] = "";
      return acc;
    }, {}),
  });

  const initialQuestions = (rules?: PartRule, mode?: QuestionType): UIQuestion[] => {
    if (!rules) return [];
    const letters = rules.optionLetters as string[];

    if (partNumber === 7) {
      if (mode === "READING_SINGLE_PASSAGE") {
        return Array.from({ length: DEFAULT_SINGLE_MIN }, () => makeEmptyQuestion(letters));
      }
      // double/triple → exactly 5
      return Array.from({ length: DOUBLE_TRIPLE_COUNT }, () => makeEmptyQuestion(letters));
    }

    return Array.from({ length: rules.questionsPerGroup }, () => makeEmptyQuestion(letters));
  };

  const [questions, setQuestions] = useState<UIQuestion[]>(initialQuestions(baseRules, p7Mode));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens or part/mode changes
  useEffect(() => {
    if (!open) return;
    setImageUrl("");
    setAudioUrl("");
    setPassageText("");
    setQuestions(initialQuestions(baseRules, p7Mode));
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, partNumber, p7Mode]);

  if (!baseRules || !partId || !partNumber) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm câu hỏi</DialogTitle>
            <DialogDescription>Vui lòng chọn một phần thi trước khi thêm câu hỏi.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const optionLetters = baseRules.optionLetters as string[];

  const onChangeQuestionField = (idx: number, field: keyof UIQuestion, value: string) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));
  };

  const onChangeOption = (idx: number, letter: "A" | "B" | "C" | "D", text: string) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, options: { ...q.options, [letter]: text } } : q)));
  };

  // Part 7 controls
  const canAddP7Single = partNumber === 7 && p7Mode === "READING_SINGLE_PASSAGE" && questions.length < DEFAULT_SINGLE_MAX;
  const canRemoveP7Single = partNumber === 7 && p7Mode === "READING_SINGLE_PASSAGE" && questions.length > DEFAULT_SINGLE_MIN;

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

      // ✦ Ràng buộc Part 7: phải có ÍT NHẤT một trong hai — imageUrl hoặc passageText
      if (partNumber === 7) {
        const hasImage = !!imageUrl?.trim();
        const hasPassage = !!passageText?.trim();
        if (!hasImage && !hasPassage) {
          throw new Error("Part 7: cần có ít nhất một trong hai: Image URL hoặc Passage/Context.");
        }
      }

      // Determine question type for this group
      const qType = questionTypeForPart(partNumber, partNumber === 7 ? p7Mode : undefined);

      // Build payload
      const payload: QuestionGroupRequest = {
        partId,
        passageText: baseRules.showPassage && passageText ? passageText : undefined,
        imageUrl: baseRules.showImage && imageUrl ? imageUrl : undefined,
        audioUrl: baseRules.showAudio && audioUrl ? audioUrl : undefined,
        questions: questions.map((q) => ({
          questionText: baseRules.requireQuestionText ? q.questionText || undefined : q.questionText || undefined,
          questionType: qType,
          correctAnswerOption: q.correctAnswerOption,
          explanation: q.explanation || undefined,
          options: optionLetters.map((L) => ({ optionLetter: L, optionText: q.options[L] || "" })),
        })),
      };

      // Client checks
      for (let i = 0; i < payload.questions.length; i++) {
        const qq = payload.questions[i];
        if (baseRules.requireQuestionText && !qq.questionText?.trim()) {
          throw new Error(`Câu ${i + 1}: thiếu phần "Question".`);
        }
        const validLetters = new Set(optionLetters);
        if (!validLetters.has(qq.correctAnswerOption)) {
          throw new Error(`Câu ${i + 1}: đáp án đúng phải là một trong ${Array.from(validLetters).join(", ")}.`);
        }
        for (const opt of qq.options) {
          if (!opt.optionText?.trim()) {
            throw new Error(`Câu ${i + 1}: đáp án ${opt.optionLetter} chưa có nội dung.`);
          }
        }
      }

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
    <Dialog open={open} onOpenChange={onOpenChange} >
      {/* Fixed-height, scrollable content */}
      <DialogContent className="!max-w-[60vw] !w-[60vw] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Thêm question group — {baseRules.displayName}</DialogTitle>
          <DialogDescription>
            Bám sát cấu trúc TOEIC. Mặc định: {baseRules.questionsPerGroup} câu (tùy part).
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">
          {/* Part 7 mode selector */}
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
            {baseRules.showImage && (
              <MediaUploader
                label="Image"
                value={imageUrl}
                onChange={setImageUrl}
                accept="image/*"
                folder="images"                              // BE sẽ lưu dưới prefix này
                placeholder="Dán URL ảnh hoặc tải lên"
                hint="Hỗ trợ PNG, JPG, GIF, WEBP, BMP"
                preview="image"
              />
            )}

            {baseRules.showAudio && (
              <MediaUploader
                label="Audio"
                value={audioUrl}
                onChange={setAudioUrl}
                accept="audio/*"
                folder="audios"                              // BE sẽ lưu dưới prefix này
                placeholder="Dán URL audio hoặc tải lên"
                hint="Hỗ trợ MP3, WAV, OGG, MP4, WEBM"
                preview="audio"
              />
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

          {/* Question items */}
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Question {idx + 1}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Type: <span className="font-medium">{questionTypeForPart(partNumber, partNumber === 7 ? p7Mode : undefined)}</span>
                    </span>
                  </div>
                  {partNumber === 7 && p7Mode === "READING_SINGLE_PASSAGE" && questions.length > DEFAULT_SINGLE_MIN && (
                    <Button type="button" variant="ghost" onClick={() => removeQuestionP7Single(idx)} className="h-8 px-2 text-xs">
                      Xoá câu này
                    </Button>
                  )}
                </div>

                {/* Question text */}
                {baseRules.requireQuestionText ? (
                  <div className="mb-3">
                    <Label>Question</Label>
                    <Textarea rows={2} placeholder="Nhập nội dung câu hỏi" value={q.questionText} onChange={(e) => onChangeQuestionField(idx, "questionText", e.target.value)} />
                  </div>
                ) : (
                  <>
                  {(baseRules.requireQuestionText && partNumber !== 1 && partNumber !== 2) ? (
                    <div className="mb-3">
                      <Label>Question</Label>
                      <Textarea
                        rows={2}
                        placeholder="Nhập nội dung câu hỏi"
                        value={q.questionText}
                        onChange={(e) => onChangeQuestionField(idx, "questionText", e.target.value)}
                      />
                    </div>
                  ) : null}
                  </>
                )}

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {optionLetters.map((L) => (
                    <div key={L} className="space-y-1">
                      <Label>Option {L}</Label>
                      <Input placeholder={`Nội dung đáp án ${L}`} value={q.options[L] || ""} onChange={(e) => onChangeOption(idx, L as any, e.target.value)} />
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

          {error && (
            <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={submitting}>Huỷ</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Đang tạo..." : "Tạo question group"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
