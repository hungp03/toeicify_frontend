import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog"
import { ConfirmDialogProps } from '@/types';


export const ConfirmDialog = ({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    cancelLabel = "Hủy",
    confirmLabel = "Xác nhận",
  }: ConfirmDialogProps & {
    open: boolean;
    onOpenChange: (v: boolean) => void;
  }) => {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{cancelLabel}</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={onConfirm}>{confirmLabel}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };