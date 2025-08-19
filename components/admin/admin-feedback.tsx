"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { toast } from "sonner";
import { MessageSquare, Clock, CheckCircle, Edit, Search, Filter, Trash2, } from "lucide-react";
import { getAllFeedbacks, updateFeedback, deleteFeedback, } from "@/lib/api/feedback";
import { Pagination } from "@/components/common/pagination";

interface FeedbackItem {
    id: number;
    content: string;
    submittedAt: string;
    status: "PENDING" | "PROCESSING" | "PROCESSED";
    adminNote?: string;
    attachments?: string[];
    userEmail?: string;
}

export default function AdminFeedback() {
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "PENDING" | "PROCESSING" | "PROCESSED"
    >("all");
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(
        null
    );
    const [adminNote, setAdminNote] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<FeedbackItem | null>(null);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchFeedbacks = async () => {
        try {
            const res = await getAllFeedbacks(page + 1, 10, "submittedAt,DESC");
            setFeedbacks(res.result);
            setTotalPages(res.meta.pages);
        } catch {
            toast.error("Không thể tải danh sách phản hồi")
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, [page]);

    const handleProcessFeedback = async (
        id: number,
        status: string,
        note: string
    ) => {
        setIsProcessing(true);
        try {
            await updateFeedback(id, status, note);
            toast.success("Cập nhật phản hồi thành công");
            setSelectedFeedback(null);
            setAdminNote("");
            fetchFeedbacks();
        } catch {
            toast.error("Có lỗi xảy ra khi cập nhật phản hồi. Vui lòng thử lại sau.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteFeedback = async (id: number) => {
        setIsDeleting(true);
        try {
            await deleteFeedback(id);
            toast.success("Xóa phản hồi thành công");
            setDeleteTarget(null);
            fetchFeedbacks();
        } catch {
            toast.error("Có lỗi xảy ra khi xóa phản hồi. Vui lòng thử lại sau.");
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleString("vi-VN");

    const filteredFeedback = feedbacks.filter((item) => {
        const matchesSearch =
            item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                    Quản lý Phản hồi
                </h1>
                <p className="text-muted-foreground">
                    Xem và phản hồi các góp ý từ người dùng
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm phản hồi..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select
                                value={statusFilter}
                                onValueChange={(value: "all" | "PENDING" | "PROCESSING" | "PROCESSED") =>
                                    setStatusFilter(value)
                                }
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                                    <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                                    <SelectItem value="PROCESSED">Đã xử lý</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Feedback List */}
            <div className="space-y-4">
                {filteredFeedback.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Không tìm thấy phản hồi nào</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredFeedback.map((item) => (
                        <Card key={item.id}>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <Badge
                                            variant={
                                                item.status === "PROCESSED"
                                                    ? "default"
                                                    : item.status === "PROCESSING"
                                                        ? "outline"
                                                        : "secondary"
                                            }
                                            className="flex items-center gap-1"
                                        >
                                            {item.status === "PROCESSED" && (
                                                <CheckCircle className="w-3 h-3" />
                                            )}
                                            {item.status === "PROCESSING" && (
                                                <Clock className="w-3 h-3 text-orange-500" />
                                            )}
                                            {item.status === "PENDING" && <Clock className="w-3 h-3" />}

                                            {item.status === "PROCESSED"
                                                ? "Đã xử lý"
                                                : item.status === "PROCESSING"
                                                    ? "Đang xử lý"
                                                    : "Chờ xử lý"}
                                        </Badge>

                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(item.submittedAt)}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedFeedback(item);
                                                    setAdminNote(item.adminNote || "");
                                                }}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setDeleteTarget(item)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-foreground leading-relaxed">{item.content}</p>
                                        {item.userEmail && (
                                            <p className="text-sm text-muted-foreground">
                                                Từ: {item.userEmail}
                                            </p>
                                        )}
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
                    ))
                )}
            </div>

            <Pagination
                totalPages={totalPages}
                currentPage={page}
                onPageChange={(p) => setPage(p)}
            />

            <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xử lý phản hồi</DialogTitle>
                    </DialogHeader>

                    {selectedFeedback && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nội dung phản hồi:</Label>
                                <div className="bg-secondary/50 p-3 rounded-md">
                                    <p className="text-sm">{selectedFeedback.content}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Trạng thái</Label>
                                <Select
                                    value={selectedFeedback.status}
                                    onValueChange={(value: "PENDING" | "PROCESSING" | "PROCESSED") =>
                                        setSelectedFeedback({
                                            ...selectedFeedback,
                                            status: value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                                        <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                                        <SelectItem value="PROCESSED">Đã xử lý</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="admin-note">Ghi chú/Phản hồi của Admin:</Label>
                                <Textarea
                                    id="admin-note"
                                    placeholder="Nhập phản hồi hoặc ghi chú xử lý..."
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setSelectedFeedback(null)}>
                                    Hủy
                                </Button>
                                <Button
                                    onClick={() =>
                                        handleProcessFeedback(
                                            selectedFeedback.id,
                                            selectedFeedback.status,
                                            adminNote
                                        )
                                    }
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? "Đang xử lý..." : "Cập nhật"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xóa phản hồi</DialogTitle>
                    </DialogHeader>
                    <p>Bạn có chắc muốn xóa phản hồi này?</p>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleDeleteFeedback(deleteTarget!.id)}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Đang xóa..." : "Xóa"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
