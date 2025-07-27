'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TestDialogProps } from '@/types/flashcard';



export default function TestDialog({ open, max, defaultCount, onConfirm, onClose }: TestDialogProps) {
  const [value, setValue] = useState(defaultCount);

  useEffect(() => {
    if (open) {
      setValue(defaultCount);
    }
  }, [open, defaultCount]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chọn số câu hỏi trong bài kiểm tra</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Input
            type="number"
            value={value}
            min={1}
            max={max}
            onChange={(e) => setValue(Number(e.target.value))}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Huỷ
            </Button>
            <Button onClick={() => onConfirm(Math.min(Math.max(value, 1), max))}>
              Bắt đầu làm bài
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
