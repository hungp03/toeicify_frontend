'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch'; // 👈 dùng switch
import type { QuestionTypeTest, TestDialogProps } from '@/types/flashcard';

const ALL_TYPES: QuestionTypeTest[] = ['truefalse', 'multiple', 'written'];

export default function TestDialog({
  open,
  max,
  defaultCount,
  defaultTypes,
  onConfirm,
  onClose,
}: TestDialogProps) {
  const [value, setValue] = useState(defaultCount);

  // mặc định: nếu không truyền defaultTypes -> bật cả 3
  const [tf, setTf] = useState<boolean>(defaultTypes ? defaultTypes.includes('truefalse') : true);
  const [mc, setMc] = useState<boolean>(defaultTypes ? defaultTypes.includes('multiple')   : true);
  const [wr, setWr] = useState<boolean>(defaultTypes ? defaultTypes.includes('written')    : true);

  useEffect(() => {
    if (open) {
      setValue(defaultCount);
      setTf(defaultTypes ? defaultTypes.includes('truefalse') : true);
      setMc(defaultTypes ? defaultTypes.includes('multiple')   : true);
      setWr(defaultTypes ? defaultTypes.includes('written')    : true);
    }
  }, [open, defaultCount, defaultTypes]);

  const selectedTypes = useMemo<QuestionTypeTest[]>(() => {
    const arr: QuestionTypeTest[] = [];
    if (tf) arr.push('truefalse');
    if (mc) arr.push('multiple');
    if (wr) arr.push('written');
    return arr.length ? arr : ALL_TYPES; // tắt hết -> dùng cả ba loại
  }, [tf, mc, wr]);

  const disabled = value < 1 || value > max;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thiết lập bài kiểm tra</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          {/* Số câu hỏi */}
          <div>
            <div className="text-sm text-gray-500 mb-1">Số câu hỏi (tối đa {max})</div>
            <Input
              type="number"
              value={value}
              min={1}
              max={max}
              onChange={(e) => setValue(Number(e.target.value))}
            />
          </div>

          {/* Khu vực công tắc loại câu hỏi (như ảnh 2) */}
          <div className="border-t pt-3 space-y-3">
            <div className="text-sm text-gray-500">Answer with</div>

            <div className="flex items-center justify-between">
              <span className="text-base font-medium">True/False</span>
              <Switch checked={tf} onCheckedChange={setTf} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base font-medium">Multiple choice</span>
              <Switch checked={mc} onCheckedChange={setMc} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base font-medium">Written</span>
              <Switch checked={wr} onCheckedChange={setWr} />
            </div>

            <p className="text-xs text-gray-500">
              Nếu không chọn loại nào, hệ thống sẽ dùng cả ba loại.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Huỷ
            </Button>
            <Button
              disabled={disabled}
              onClick={() => onConfirm(Math.min(Math.max(value, 1), max), selectedTypes)}
            >
              Bắt đầu làm bài
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
