import api from "@/lib/axios";

export async function registerFcmTokenApi(userId: number, token: string) {
    return api.post("/notifications/register-token", {
        userId,
        token,
    });
}

export async function getNotifications(page: number = 0, size: number = 20) {
    return api.get("/notifications", {
        params: {
            page,
            size,
        },
    });
}

export async function markNotificationAsRead(notificationId: number) {
    return api.post(`/notifications/mark-read/${notificationId}`);
}

export async function markAllNotificationsAsRead() {
    return api.post("/notifications/mark-all-read");
}

export async function deleteNotification(notificationId: number) {
    return api.delete(`/notifications/${notificationId}`);
}

export async function deleteAllNotifications() {
    return api.delete("/notifications");
}