"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth";
import { MessageSquare, Plus, Clock, CheckCircle, X, LogIn, Loader2 } from "lucide-react";
import { getFeedbackListByUser, createFeedback, deleteFeedback } from "@/lib/api/feedback"
import { FeedbackResponse } from "@/types";
import { uploadMultipleMedia } from "@/lib/api/media";
import { Pagination } from "@/components/common/pagination";

export default function Feedback() {
    const router = useRouter();
    const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [feedbackContent, setFeedbackContent] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const user = useAuthStore((state) => state.user);
    const hasHydrated = useAuthStore((state) => state.hasHydrated);
    const isFetchingUser = useAuthStore((state) => state.isFetchingUser);
    const isAuthenticated = !!user;

    const fetchFeedbacks = async (p = page) => {
        setLoading(true);
        try {
            const res = await getFeedbackListByUser(p + 1, 10);
            setFeedbacks(res.result);
            setTotalPages(res.meta.pages);
        } catch {
            toast.error("Không tải được danh sách góp ý");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const imageFiles = files.filter(file => file.type.startsWith("image/"));

        if (imageFiles.length !== files.length) {
            toast.warning("Vui lòng chỉ tải lên hình ảnh");
            return;
        }

        setAttachments(prev => [...prev, ...imageFiles].slice(0, 3));
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!feedbackContent.trim()) {
            toast.warning("Vui lòng nhập nội dung góp ý");
            return;
        }

        setIsSubmitting(true);

        try {
            let uploadedUrls: string[] = [];
            if (attachments.length > 0) {
                uploadedUrls = await uploadMultipleMedia(attachments);
            }
            await createFeedback(
                feedbackContent, uploadedUrls
            );
            toast.success("Góp ý của bạn đã được gửi thành công! Cảm ơn bạn đã giúp chúng tôi cải thiện ứng dụng.");
            setFeedbackContent("");
            setAttachments([]);
            fetchFeedbacks(0);
            setPage(0);
        } catch (error) {
            toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc muốn xóa góp ý này?")) return;

        try {
            await deleteFeedback(id);
            toast.success("Đã xoá góp ý thành công");
            fetchFeedbacks(page);
        } catch {
            toast.error("Không xoá được góp ý, vui lòng thử lại");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("vi-VN");
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchFeedbacks(page);
        }
    }, [page, isAuthenticated]);

    if (!hasHydrated || isFetchingUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <Card className="w-full max-w-md animate-pulse">
                    <CardHeader>
                        <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
                        <div className="h-4 w-64 bg-gray-200 rounded" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-10 w-full bg-gray-200 rounded" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Góp ý & Phản hồi
                        </CardTitle>
                        <CardDescription>
                            Vui lòng đăng nhập để xem và tạo góp ý của bạn.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-3">
                        <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={() => router.push('/login')}>
                            <LogIn className="h-4 w-4 mr-2" />
                            Đăng nhập
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Phản hồi & Góp ý</h1>
                <p className="text-muted-foreground">
                    Chia sẻ ý kiến của bạn để giúp chúng tôi cải thiện ứng dụng tốt hơn
                </p>
            </div>

            <Tabs defaultValue="list" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="list" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Danh sách góp ý
                    </TabsTrigger>
                    <TabsTrigger value="submit" className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Gửi góp ý mới
                    </TabsTrigger>

                </TabsList>

                {/* Tab gửi góp ý */}
                <TabsContent value="submit">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Gửi góp ý mới
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="content">Nội dung góp ý *</Label>
                                    <Textarea
                                        id="content"
                                        placeholder="Chia sẻ ý kiến, đề xuất hoặc báo lỗi của bạn..."
                                        value={feedbackContent}
                                        onChange={(e) => setFeedbackContent(e.target.value)}
                                        className="min-h-[120px]"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="attachments">Hình ảnh đính kèm (tối đa 3 file)</Label>
                                    <Input
                                        id="attachments"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileUpload}
                                        className="h-12 file:h-8 file:mr-4 file:px-4 file:rounded-md file:border-0 
               file:text-sm file:font-medium file:bg-blue-600 file:text-primary-foreground 
               hover:file:bg-blue-500"
                                    />
                                    {attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-3 mt-3">
                                            {attachments.map((file, index) => {
                                                const previewUrl = URL.createObjectURL(file);
                                                return (
                                                    <div
                                                        key={index}
                                                        className="relative w-24 h-24 rounded-md overflow-hidden border shadow-sm"
                                                    >
                                                        <img
                                                            src={previewUrl}
                                                            alt={file.name}
                                                            className="object-cover w-full h-full"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAttachment(index)}
                                                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>


                                <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500">
                                    {isSubmitting ? "Đang gửi..." : "Gửi góp ý"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab danh sách góp ý */}
                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto mt-10 text-blue-600" /> :
                    <TabsContent value="list">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Danh sách góp ý của bạn</h2>
                            </div>

                            {feedbacks.length === 0 ? (
                                <Card>
                                    <CardContent className="py-8 text-center">
                                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">Chưa có góp ý nào</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {feedbacks.map((item) => (
                                        <Card key={item.id}>
                                            <CardContent className="pt-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <Badge
                                                            variant={
                                                                item.status === "PROCESSED"
                                                                    ? "default"
                                                                    : ("secondary" as "secondary" | "default")
                                                            }
                                                            className="flex items-center gap-1"
                                                        >
                                                            {item.status === "PROCESSED" ? (
                                                                <CheckCircle className="w-3 h-3" />
                                                            ) : (
                                                                <Clock className="w-3 h-3" />
                                                            )}
                                                            {item.status === "PROCESSED" ? "Đã xử lý" : "Đang xử lý"}
                                                        </Badge>


                                                        <div className="text-sm text-muted-foreground">
                                                            {formatDate(item.submittedAt)}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 grid grid-cols-8 gap-2">
                                                        <p className="text-foreground leading-relaxed col-span-7">{item.content}</p>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700 col-span-1"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>


                                                    {item.adminNote && (
                                                        <div className="bg-secondary/50 p-3 rounded-md border-l-4 border-primary">
                                                            <p className="text-sm font-medium text-primary mb-1">
                                                                Phản hồi từ Admin:
                                                            </p>
                                                            <p className="text-sm">{item.adminNote}</p>
                                                        </div>
                                                    )}

                                                    {item.attachments && item.attachments.length > 0 && (
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium">Hình ảnh đính kèm:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {item.attachments.map((attachment, index) => (
                                                                    <img
                                                                        key={index}
                                                                        src={attachment}
                                                                        alt={`Attachment ${index + 1}`}
                                                                        className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                                                                        onClick={() => window.open(attachment, "_blank")}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    <Pagination
                                        totalPages={totalPages}
                                        currentPage={page}
                                        onPageChange={(newPage) => setPage(newPage)}
                                    />
                                </div>
                            )}
                        </div>
                    </TabsContent>
                }
            </Tabs>
        </div>
    );
}
