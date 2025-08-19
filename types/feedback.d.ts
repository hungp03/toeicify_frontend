export type FeedbackResponse = {
  id: number;
  content: string;
  status: "PENDING" | "PROCESSING" | "PROCESSED";
  adminNote?: string;
  submittedAt: string;
  processedAt?: string;
  userName: string;
  attachments?: string[];
};

