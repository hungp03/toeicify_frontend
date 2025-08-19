import api from "@/lib/axios";

export const getFeedbackListByUser = async (page: number, size: number) => {
    const res = await api.get('/feedbacks/user', {
        params: {
            page,
            size,
            sort: 'submittedAt,desc'
        }
    });
    return res.data;
};

export const createFeedback = async (content: string, attachments?: string[]) => {
    const payload: any = { content };
    if (attachments && attachments.length > 0) {
        payload.attachments = attachments;
    }

    return api.post('/feedbacks', payload);
};

export const deleteFeedback = async (id: number) => {
    return api.delete(`/feedbacks/${id}`);
};

export const getAllFeedbacks = async (page: number, size: number, sort: string) => {
    const res = await api.get(`/feedbacks/all`, {
        params: {
            page,
            size,
            sort
        }
    });
    return res.data;
};

export const updateFeedback = async (id: number, status: string, adminNote?: string) => {
    const payload: any = { status };
    if (adminNote) {
        payload.adminNote = adminNote;
    }
    return api.patch(`/feedbacks/${id}`, payload);
};
