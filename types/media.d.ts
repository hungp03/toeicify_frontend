export type MediaUploaderProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept: string;              // "image/*" hoặc "audio/*"
  folder: string;              // "images" | "audios" | ...
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
  preview?: "image" | "audio";
};