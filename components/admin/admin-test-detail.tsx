'use client';

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getAllExamCategoriesList, getExamById, updateExam } from "@/lib/api/exam";
import { getQuestionGroupsByPartId } from "@/lib/api/question";
import { deleteExamPartById, getMissingParts } from "@/lib/api/exam_part";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { Loader, Settings, PlusCircle, ChevronLeft, Trash2, Volume2, Eye, Edit, Image as ImageIcon, FileText  } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { Category, ExamPart } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { QuestionDetailModal, QuestionEditGroupDialog, QuestionAddGroupDialog, ConfirmDeleteGroupDialog  } from "./questions";
import { QuestionGroupResponse } from "@/types/question";
import { EditExamDialog, AddMissingPartsDialog } from "./dialogs";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";




export function AdminTestsDetailContent() {
  const { id } = useParams();
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [selected, setSelected] = useState<ExamPart | null>(null);
  const [questionGroups, setQuestionGroups] = useState<QuestionGroupResponse[]>([]);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // dialogs/groups
  const [showCreateDialog , setShowCreateDialog] = useState(false);
  const [selectedQuestionDetail, setSelectedQuestionDetail] = useState<{ groupId: number; questionId: number; } | null>(null);
  const [editingGroup, setEditingGroup] = useState<QuestionGroupResponse | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<QuestionGroupResponse | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Edit exam
  const [showEditExam, setShowEditExam] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Delete part
  const [deletingPart, setDeletingPart] = useState<ExamPart | null>(null);

  // ---- NEW: Add Missing Parts Dialog state ----
  const [showAddPartsDialog, setShowAddPartsDialog] = useState(false);


  useEffect(() => {
    (async () => {
      try {
        const res = await getAllExamCategoriesList();
        setCategories(res.data || []);
      } catch {}
    })();
  }, []);

  // === Read-only guard: PUBLIC | CANCELLED => chỉ xem ===
  const isReadOnly = useMemo(() => {
    const s = (exam?.status || '').toUpperCase();
    return s === 'PUBLIC' || s === 'CANCELLED';
  }, [exam?.status]);

  // Khi chuyển sang read-only, đóng các dialog chỉnh sửa nếu đang mở
  useEffect(() => {
    if (isReadOnly) {
      setShowCreateDialog(false);
      setShowEditDialog(false);
      setShowDeleteDialog(false);
      setShowEditExam(false);
      setShowAddPartsDialog(false);
    }
  }, [isReadOnly]);

  const openEditExam = () => {
    if (isReadOnly) {
      toast.warning("Đề đang ở trạng thái không cho phép chỉnh sửa. Hãy chuyển về PRIVATE hoặc PENDING.");
      return;
    }
    setShowEditExam(true);
  };
  // ---- NEW: mở dialog + fetch danh sách part còn thiếu ----
  const handleOpenAddParts = async () => {
    if (isReadOnly) {
      toast.warning("Không thể thêm phần thi khi đề ở trạng thái PUBLIC hoặc CANCELLED.");
      return;
    }
    setShowAddPartsDialog(true);
    try {
      const res = await getMissingParts(Number(id));
      // Không auto-select; nếu muốn chọn hết mặc định:
      // setSelectedMissing((res.data || []).map(p => p.partNumber));
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Không tải được danh sách part còn thiếu.";
      toast.error(msg);
    } finally {
    }
  };

  // Chuẩn hoá dữ liệu initial cho dialog
  const examInitial = exam && {
    examName: exam.examName,
    examDescription: exam.examDescription,
    totalQuestions: exam.totalQuestions,
    listeningAudioUrl: exam.listeningAudioUrl,
    categoryId: exam.categoryId,
    createdAt: exam.createdAt ?? null,
    createdByName: exam.createdByName ?? "",
    status: exam.status,
    examParts: (exam.examParts || []).map((p: any) => ({
      partId: p.partId,
      partNumber: p.partNumber,
      partName: p.partName,
      description: p.description || "",
      questionCount: p.questionCount || 0,
      expectedQuestionCount: p.expectedQuestionCount || 0,
    })),
  };

  // examLite để truyền cho dialog thêm part
  const examLiteForAdd = exam && {
    examId: exam.examId,
    examName: exam.examName,
    examDescription: exam.examDescription,
    totalQuestions: exam.totalQuestions,
    listeningAudioUrl: exam.listeningAudioUrl,
    categoryId: exam.categoryId,
    examParts: (exam.examParts || []).map((p: any) => ({
      partId: p.partId,
      partNumber: p.partNumber,
      partName: p.partName,
      description: p.description || "",
      questionCount: p.questionCount ?? 0,
    })),
  };


  useEffect(() => {
    fetchExam();
  }, [id]);
  const fetchExam = async () => {
    try {
      setLoading(true);
      const res = await getExamById(Number(id));
      const data = res.data;
      setExam(data);

      // Auto-select Part 1 CHỈ khi chưa chọn part nào
      if (selectedPart === null && Array.isArray(data.examParts) && data.examParts.length) {
        // ưu tiên Part 1, fallback: part có partNumber nhỏ nhất
        const preferred =
          data.examParts.find((p: ExamPart) => p.partNumber === 1) ||
          [...data.examParts].sort((a: ExamPart, b: ExamPart) => a.partNumber - b.partNumber)[0];

        if (preferred && preferred.partId) {
          setSelectedPart(preferred.partNumber);
          setSelected(preferred);
          try {
            const qRes = await getQuestionGroupsByPartId(preferred.partId);
            setQuestionGroups(qRes.data);
          } catch (err) {
            console.error("Failed to load questions for default part", err);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load exam", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPartAndGroups = async (partNumber: number) => {
    // 1) luôn lấy exam mới nhất để đồng bộ totalQuestions + questionCount
    const examRes = await getExamById(Number(id));
    const freshExam = examRes.data;
    setExam(freshExam);
  
    // 2) tìm lại part theo partNumber từ exam mới
    const updatedPart = freshExam.examParts.find((p: ExamPart) => p.partNumber === partNumber);
    if (!updatedPart) throw new Error("Không tìm thấy part sau khi cập nhật");
    setSelected(updatedPart);
  };

  const loadQuestions = async (partNumber: number) => {
    setSelectedPart(partNumber);
  
    try {
      const selectedPartObj = exam.examParts.find((p: ExamPart) => p.partNumber === partNumber);

      if (!selectedPartObj || !selectedPartObj.partId) {
        throw new Error("Không tìm thấy part tương ứng hoặc partId rỗng");
      }

      setSelected(selectedPartObj);
      
      const res = await getQuestionGroupsByPartId(selectedPartObj.partId); // dùng partId thật
  
      setQuestionGroups(res.data); // ← danh sách group chứa question + options
    } catch (err) {
      console.error("Failed to load questions", err);
    }
  };


  const handleDeleteSelectedPart = async () => {
    if (!deletingPart?.partId) return;
    if (isReadOnly) {
      toast.warning("Không thể thêm phần thi khi đề ở trạng thái PUBLIC hoặc CANCELLED.");
      return;
    }
    try {
      await deleteExamPartById(deletingPart.partId);
  
      toast.success(`Đã xóa Part ${deletingPart.partNumber}`);
      setDeletingPart(null);
  
      // reset selection để fetchExam tự auto-select Part 1 hoặc part nhỏ nhất còn lại
      setSelectedPart(null);
      setSelected(null);
      setQuestionGroups([]);
  
      await fetchExam();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Không thể xóa phần thi.";
      toast.error(msg);
    }
  };
  

  const description = exam?.examDescription || "";
  const truncatedDescription = description.slice(0, 200);
  const isTruncated = description.length > 200;

  return (
    <div className="space-y-6">
        {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2">Đang tải...</span>
        </div>
      ) : (
        <>
            {/* Readonly banner */}
            {isReadOnly && (
              <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Đề đang ở trạng thái <b>{exam.status}</b> — chỉ cho phép xem. Muốn chỉnh sửa, hãy chuyển về <b>PRIVATE</b> hoặc <b>PENDING</b>.
              </div>
            )}
                {/* Header & Actions */}
                <div className="flex justify-between items-center border-b pb-3 mb-3">
                <div className="flex items-center gap-3">
                <Link href="/admin/tests" className="flex items-center gap-2 text-gray-600 hover:text-black transition">
                    <ChevronLeft className="h-5 w-5" />
                    <h1 className="text-xl font-medium">{exam.examName}</h1>
                </Link>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="w-11 h-11"
                      title={isReadOnly ? "Không thể chỉnh sửa ở trạng thái hiện tại" : "Chỉnh sửa đề"}
                      onClick={openEditExam}
                      disabled={isReadOnly}
                    >
                      <Settings className="h-5 w-5" />
                    </Button>

                    <Button
                      onClick={handleOpenAddParts}
                      className="bg-blue-600 text-white hover:bg-blue-700 h-11 rounded-md px-4"
                      disabled={isReadOnly}
                      title={isReadOnly ? "Không thể thêm phần thi ở trạng thái hiện tại" : "Thêm phần thi"}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Thêm phần thi
                    </Button>
                </div>
                </div>
                
                {/* Exam Info */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{exam.examName}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">BY</span> {exam.createdByName} /{" "}
                    <span className="font-medium">AT</span> {formatDate(exam.createdAt)} /{" "}
                    <span className="font-medium">IN</span> {exam.categoryName}
                    </p>

                    {/* Mô tả */}
                    <div className="mt-4">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Mô tả</h3>
                    <p className="text-gray-800">
                        {showFullDescription ? description : truncatedDescription}
                        {isTruncated && (
                        <button
                            className="ml-2 text-blue-600 hover:underline text-sm"
                            onClick={() => setShowFullDescription(!showFullDescription)}
                        >
                            {showFullDescription ? "Ẩn bớt" : "Xem thêm"}
                        </button>
                        )}
                    </p>
                    </div>

                    {/* Audio */}
                    {exam.listeningAudioUrl && (
                    <div className="mt-4">
                        <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Audio</h3>
                        <audio controls className="w-full max-w-lg mt-1 rounded">
                        <source src={exam.listeningAudioUrl} type="audio/mpeg" />
                        Trình duyệt không hỗ trợ audio.
                        </audio>
                    </div>
                    )}

                    {/* Info block */}
                    <div className="w-full sm:w-[80%] mt-6 border rounded-lg p-4 bg-gray-50 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Trạng thái</p>
                        <Badge variant="outline">{exam.status}</Badge>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Tổng câu hỏi</p>
                        <p className="text-base font-semibold text-gray-900">{exam.totalQuestions}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Tổng phần thi</p>
                        <p className="text-base font-semibold text-gray-900">{exam.examParts?.length || 0}</p>
                    </div>
                    </div>
                </div>

                {/* Danh sách part */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Các phần thi:</h2>
                    <div className="flex gap-4 border-b">
                    {[...exam.examParts]                      
                    .sort((a: ExamPart, b: ExamPart) => a.partNumber - b.partNumber)
                    .map((part: any) => (
                        <button
                        key={part.partNumber}
                        onClick={() => loadQuestions(part.partNumber)}
                        className={clsx(
                            "px-4 py-2 text-sm font-medium transition",
                            selectedPart === part.partNumber
                            ? "text-black border-b-2 border-black"
                            : "text-muted-foreground hover:text-black"
                        )}
                        >
                        {selectedPart === part.partNumber && selected && selected.questionCount > 0 ?  `
                          Part ${part.partNumber} (${part.questionCount})`
                        : `Part ${part.partNumber}`}
                        </button>
                    ))}
                    </div>
                </div>

                {/* Questions of selected part */}
                {selectedPart && selected && (
                <div className="space-y-3">
                <Separator />
                
                <div className="bg-gray-100 p-3 rounded-sm w-full flex flex-wrap justify-between items-center">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                    <span className="uppercase font-semibold tracking-widest">
                    {selected.partNumber}
                    </span>

                    <span className="uppercase tracking-wider text-muted-foreground">
                    {selected.partName?.toLowerCase().includes("part") ? selected.partName : `Part ${selected.partName}`}
                    </span>

                    {selected.description && (
                    <span className="text-muted-foreground">
                        {selected.description}
                    </span>
                    )}

                    <span className="uppercase tracking-wider text-muted-foreground">
                    {selected.questionCount} / {selected.expectedQuestionCount} câu hỏi
                    </span>
                </div>

                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                {/* Delete part (chặn khi read-only hoặc còn câu hỏi) */}
                <button
                    className={clsx(
                      "text-xs font-semibold uppercase underline-offset-2 transition",
                      "text-red-600 hover:underline",
                      (isReadOnly || selected.questionCount > 0) && "opacity-40 cursor-not-allowed hover:no-underline"
                    )}
                    title={
                      isReadOnly
                        ? "Không thể xóa ở trạng thái hiện tại"
                        : selected.questionCount > 0
                        ? "Không thể xóa vì phần này còn câu hỏi"
                        : "Xóa phần thi"
                    }
                    disabled={isReadOnly || selected.questionCount > 0}
                    onClick={() => {
                      if (isReadOnly) {
                        toast.warning("Đề ở trạng thái không cho phép chỉnh sửa.");
                        return;
                      }
                      setDeletingPart(selected);
                    }}
                  >
                    Delete
                  </button>

                {/* NEW: Add Question */}
                <button
                  className={clsx(
                    "text-xs font-semibold uppercase underline-offset-2 transition",
                    "text-green-600 hover:underline",
                    (isReadOnly || selected.questionCount >= selected.expectedQuestionCount) &&
                    "opacity-40 cursor-not-allowed hover:no-underline"
                  )}
                  disabled={isReadOnly || selected.questionCount >= selected.expectedQuestionCount}
                  onClick={() => {
                    if (isReadOnly) {
                      toast.warning("Đề ở trạng thái không cho phép chỉnh sửa.");
                      return;
                    }
                    setShowCreateDialog(true);
                  }}
                >
                  Add Question
                </button>
                    
                </div>
                </div>
                {/* Hiển thị danh sách nhóm câu hỏi */}
              <div className="space-y-6 mt-4">
                {questionGroups.length === 0 ? (
                  <p className="text-gray-600">Không có câu hỏi nào.</p>
                ) : (
                  <Card>
                  <CardHeader>
                    <CardTitle>Danh sách câu hỏi</CardTitle>
                  </CardHeader>
                
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">Group ID</TableHead>
                          <TableHead className="text-center">Question ID</TableHead>
                          <TableHead className="text-left">Câu hỏi</TableHead>
                          <TableHead className="text-center">Loại</TableHead>
                          <TableHead className="text-center">Phương tiện</TableHead>
                          <TableHead className="text-center">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                
                      <TableBody>
                        {questionGroups.flatMap((group) =>
                          group.questions.map((question) => (
                            <TableRow key={question.questionId}>
                              <TableCell className="text-center">{group.groupId}</TableCell>
                              <TableCell className="text-center">{question.questionId}</TableCell>
                              <TableCell className="text-left max-w-md truncate">
                                {question.questionText}
                              </TableCell>
                              <TableCell className="text-center">
                                {question.questionType
                                  ? question.questionType.replace(/_/g, " ")
                                  : ""}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center space-x-2">
                                  {group.imageUrl && (
                                    <ImageIcon className="h-4 w-4 text-green-600" />
                                  )}
                                  {group.audioUrl && (
                                    <Volume2 className="h-4 w-4 text-blue-600" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (question.questionId !== undefined && group.groupId !== undefined) {
                                      setSelectedQuestionDetail({
                                        groupId: group.groupId,
                                        questionId: question.questionId,
                                      });
                                    }}
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {/* Edit group — chặn khi read-only */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isReadOnly}
                                    title={isReadOnly ? "Không thể chỉnh sửa ở trạng thái hiện tại" : "Chỉnh sửa nhóm"}
                                    onClick={() => {
                                      if (isReadOnly) {
                                        toast.warning("Đề ở trạng thái không cho phép chỉnh sửa.");
                                        return;
                                      }
                                      setEditingGroup(group);
                                      setShowEditDialog(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {/* Delete group — chặn khi read-only */}
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={isReadOnly}
                                      title={isReadOnly ? "Không thể xóa ở trạng thái hiện tại" : "Xoá group này"}
                                      onClick={() => {
                                        if (isReadOnly) {
                                          toast.warning("Đề ở trạng thái không cho phép chỉnh sửa.");
                                          return;
                                        }
                                        setDeletingGroup(group);
                                        setShowDeleteDialog(true);
                                      }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    
                    {selectedQuestionDetail && (
                      <QuestionDetailModal
                        groupId={selectedQuestionDetail.groupId}
                        questionId={selectedQuestionDetail.questionId}
                        groups={questionGroups}               // đã là QuestionGroupResponse[]
                        onClose={() => setSelectedQuestionDetail(null)}
                      />
                    )}
                    {editingGroup && !isReadOnly && (
                      <QuestionEditGroupDialog
                        open={showEditDialog}
                        onOpenChange={setShowEditDialog}
                        group={editingGroup}
                        partNumber={selected?.partNumber ?? null}
                        partId={selected?.partId ?? null}
                        onUpdated={async () => {
                          await loadQuestions(selected!.partNumber)
                          await refreshPartAndGroups(selected!.partNumber)
                        }}
                      />
                    )}
                    {deletingGroup && !isReadOnly && (
                      <ConfirmDeleteGroupDialog
                        open={showDeleteDialog}
                        onOpenChange={setShowDeleteDialog}
                        group={deletingGroup}
                        onDeleted={async() => {
                          await loadQuestions(selected!.partNumber)
                          await refreshPartAndGroups(selected.partNumber);
                          setDeletingGroup(null);
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
                )}
                </div>
                </div>
              )}
              {showCreateDialog && !isReadOnly && (
                      <QuestionAddGroupDialog
                      open={showCreateDialog}
                      onOpenChange={setShowCreateDialog}
                      partId={selected?.partId ?? null}
                      partNumber={selectedPart ?? null}
                      onCreated={async () => {
                        await loadQuestions(selectedPart!)
                        await refreshPartAndGroups(selectedPart!)
                      }}
                    />
                    )}
            {exam && !isReadOnly && (
              <EditExamDialog
                open={showEditExam}
                onOpenChange={setShowEditExam}
                examId={exam.examId}
                initial={examInitial}
                categories={categories}
                onUpdated={async () => {
                  await fetchExam(); // làm mới toàn bộ exam
                  // nếu đang đứng ở 1 part cụ thể, refresh khối câu hỏi đang xem:
                  if (selected?.partNumber) {
                    await loadQuestions(selected.partNumber);
                  }
                }}
              />
            )}
            {deletingPart && !isReadOnly && (
              <Dialog
                open={!!deletingPart}
                onOpenChange={(open) => {
                  if (!open) setDeletingPart(null);
                }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Xóa phần thi</DialogTitle>
                    <DialogDescription>
                      Bạn có chắc muốn xóa <b>Part {deletingPart.partNumber}</b>
                      {deletingPart.partName ? ` (${deletingPart.partName})` : ""}?
                      <br />
                      Thao tác này không thể hoàn tác.
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter>
                    <Button variant="secondary" onClick={() => setDeletingPart(null)}>
                      Hủy
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteSelectedPart}>
                      Xóa
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {/* Dialog Thêm Part tách file */}
            {examLiteForAdd && !isReadOnly && (
              <AddMissingPartsDialog
                open={showAddPartsDialog}
                onOpenChange={setShowAddPartsDialog}
                exam={examLiteForAdd}
                onAdded={async (addedPartNumbers) => {
                  await fetchExam();
                  // Auto-select part mới nhỏ nhất
                  if (addedPartNumbers?.length) {
                    const minNew = Math.min(...addedPartNumbers);
                    // chờ exam đã reload xong rồi load questions
                    const justAdded = (exam?.examParts || []).find((p: any) => p.partNumber === minNew);
                    if (justAdded?.partNumber) {
                      await loadQuestions(justAdded.partNumber);
                    }
                  }
                }}
              />
            )}
            </>
        )}
    </div>
  );
}

export function AdminTestsDetailLoading() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý đề thi</h1>
            <p className="text-gray-600 mt-2">Quản lý tất cả đề thi và phần thi</p>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <Loader className="h-8 w-8 text-gray-500 animate-spin" />
        </div>
      </div>
    );
  }