'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QuestionExplainResponse } from '@/types';

type Props = {
  open: boolean;
  onClose: () => void; 
  data: QuestionExplainResponse | null;
  userAnswer?: string | null;
};

export default function AnswerExplanationModal({ open, onClose, data, userAnswer }: Props) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="w-[80%] max-w-4xl sm:max-w-6xl md:max-w-7xl lg:max-w-screen-xl xl:max-w-screen-2xl max-h-[90vh] overflow-y-auto px-8 py-6"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Giải thích đáp án
            {data.questionNumber ? ` (Câu ${data.questionNumber})` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hình ảnh */}
          {data.imageUrl && (
            <div className="flex justify-center">
              <img
                src={data.imageUrl}
                alt="Question"
                className="rounded max-h-[320px] object-contain"
              />
            </div>
          )}

          {data.audioUrl && (
            <div>
              <audio controls src={data.audioUrl ?? undefined} className="w-full" />
            </div>
          )}

          {data.questionText && (
            <p className="font-semibold text-lg leading-relaxed">{data.questionText}</p>
          )}

          <ul className="list-disc ml-6 pl-4 space-y-2">
            {data.options.map((opt) => {
              let className = '';
              if (opt.optionLetter === data.correctAnswerOption) {
                className = 'text-green-600 font-semibold'; 
              } else if (opt.optionLetter === userAnswer) {
                className = 'text-red-600'; 
              }
              return (
                <li key={opt.optionLetter} className={className}>
                  {opt.optionLetter}. {opt.optionText}
                </li>
              );
            })}
          </ul>

          <div className="pt-2">
            <p className="font-semibold">Giải thích:</p>
            <p className="leading-relaxed">{data.explanation || 'Chưa có giải thích.'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
