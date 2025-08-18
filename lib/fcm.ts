import { getToken, onMessage, getMessaging } from "firebase/messaging";
import { getFirebaseApp } from "./firebase";
import { registerFcmTokenApi } from "@/lib/api/notification";
import { toast } from "sonner";

function getMessagingInstance() {
    const app = getFirebaseApp();
    if (!app) return null;
    return getMessaging(app);
}

export async function registerFcmToken(userId: number) {
    const messaging = getMessagingInstance();
    if (!messaging) return;

    try {
        const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (token) {
            await registerFcmTokenApi(userId, token);
        }
    } catch (err) {
        console.error("Error registering token:", err);
    }
}

export function listenForMessages() {
    const messaging = getMessagingInstance();
    if (!messaging) return;

    onMessage(messaging, (payload) => {
        if (payload.notification) {
            return;
        }
        if (payload.data) {
            toast(payload.data.title ?? "Thông báo", {
                description: payload.data.body,
            });
        }
    });
}