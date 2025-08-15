'use client';

import { uploadMedia } from "@/lib/api/media";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { MediaUploaderProps } from "@/types/media";

export function MediaUploader({
  label,
  value,
  onChange,
  accept,
  folder,
  placeholder,
  disabled,
  hint,
  preview,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [locked, setLocked] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onPick = () => fileRef.current?.click();

  const handleFile = async (file?: File | null) => {
    if (!file) return;

    if (accept.startsWith("image/") && !file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn đúng định dạng ảnh.");
      return;
    }
    if (accept.startsWith("audio/") && !file.type.startsWith("audio/")) {
      toast.error("Vui lòng chọn đúng định dạng audio.");
      return;
    }

    try {
      setUploading(true);
      const url = await uploadMedia(file, folder);
      onChange(url);
      setLocked(true);
      toast.success("Tải lên thành công!");
    } catch (e: any) {
      console.error("Upload error:", e);
      const msg = e?.response?.data?.message || e?.message || "Upload thất bại.";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const clearUrl = () => {
    onChange("");
    setLocked(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div className="flex gap-2">
        <Input
          placeholder={placeholder ?? "https://..."}
          value={value ?? ""}
          readOnly={locked}
          onChange={(e) => {
            if (!locked) onChange(e.target.value ?? "");
          }}
          disabled={disabled}
          className={cn(
            locked && "bg-gray-50 text-gray-700 cursor-default"
          )}
          title={locked ? "URL được tạo từ upload — chỉ có thể xoá" : undefined}
        />
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={disabled || uploading}
        />
        <Button type="button" onClick={onPick} disabled={disabled || uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải...
            </>
          ) : (
            "Tải lên"
          )}
        </Button>
      </div>

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      {value && preview === "image" && (
        <div className="mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="max-h-40 rounded border" />
        </div>
      )}
      {value && preview === "audio" && (
        <div className="mt-2">
          <audio src={value} controls className="w-full" />
        </div>
      )}

      {value && (
        <div className="mt-1 flex gap-2">
          <Button
            variant="ghost"
            type="button"
            className="h-8 px-2 text-xs"
            onClick={clearUrl}
            disabled={uploading}
          >
            Xoá URL
          </Button>
        </div>
      )}
    </div>
  );
}