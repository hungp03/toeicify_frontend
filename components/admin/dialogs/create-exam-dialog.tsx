"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle  } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateExamForm from "./create-exam-form";

export function CreateExamDialog({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
  
    const handleSuccess = () => {
      setOpen(false);
      onSuccess(); // <-- Gọi callback từ cha để reload
    };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tạo đề thi mới
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>Tạo đề thi TOEIC mới</DialogTitle>
        <CreateExamForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
