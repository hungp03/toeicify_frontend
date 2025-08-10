// src/components/questions/ConfirmDeleteGroupDialog.tsx
import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { deleteQuestionGroup } from "@/lib/api/question";
import { ConfirmDeleteGroupDialogProps } from "@/types/question";



export function ConfirmDeleteGroupDialog({ open, onOpenChange, group, onDeleted }: ConfirmDeleteGroupDialogProps) {
  const [loading, setLoading] = React.useState(false);
  if (!group) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteQuestionGroup(group.groupId);
      onOpenChange(false);
      onDeleted?.();
    } catch (e: any) {
      alert(e?.message || "Xoá group thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-3 w-[560px] max-w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 py-4 sticky top-0 z-10 bg-white border-b">
          <DialogTitle>Xoá question group</DialogTitle>
          <DialogDescription>
            Bạn sắp xoá <b>Group #{group.groupId}</b> (Part {group.partId}). Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        {/* Thông tin group */}
        <div className="space-y-3 px-6 py-4 overflow-y-auto flex-1">
          {(group.imageUrl || group.audioUrl) && (
            <div className="flex flex-col gap-2">
              {group.imageUrl && <img src={group.imageUrl} className="max-h-40 object-contain rounded border" />}
              {group.audioUrl && (
                <audio controls className="max-w-md">
                  <source src={group.audioUrl} />
                </audio>
              )}
            </div>
          )}
          {group.passageText && (
            <div className="text-sm bg-muted/40 p-3 rounded border">
              <div className="font-semibold mb-1">Passage/Context</div>
              <div className="line-clamp-5 whitespace-pre-wrap">{group.passageText}</div>
            </div>
          )}
          <Separator />
          <div className="space-y-2">
            <div className="font-semibold">Các câu hỏi trong group:</div>
            <div className="max-h-[40vh] overflow-auto space-y-3 pr-2">
              {group.questions.map((q, idx) => (
                <div key={q.questionId} className="rounded border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">Q{idx + 1}</Badge>
                    <span className="text-xs text-muted-foreground">{q.questionType}</span>
                    <span className="ml-auto text-xs">
                      Đáp án đúng: <b>{q.correctAnswerOption}</b>
                    </span>
                  </div>
                  {q.questionText && (
                    <div className="text-sm mb-2 whitespace-pre-wrap">{q.questionText}</div>
                  )}
                  <ul className="text-sm list-disc pl-5">
                    {[...q.options].sort((a,b) => a.optionLetter.localeCompare(b.optionLetter))
                      .map(opt => (
                        <li key={opt.optionId}><b>{opt.optionLetter}.</b> {opt.optionText}</li>
                      ))
                    }
                  </ul>
                  {q.explanation && (
                    <div className="text-xs text-muted-foreground mt-2">
                      <b>Giải thích:</b> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Huỷ</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Đang xoá..." : "Xoá group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
