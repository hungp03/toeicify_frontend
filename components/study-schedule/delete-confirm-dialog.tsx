"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export const DeleteConfirmDialog = ({
  open,
  onConfirm,
  onCancel,
  title = "Xác nhận xóa",
  message = "Bạn có chắc chắn muốn xóa lịch học này không? Hành động này không thể hoàn tác.",
}: DeleteConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-4">{message}</div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Hủy</Button>
          <Button variant="destructive" onClick={onConfirm}>Xóa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
