import api from "@/lib/axios";

export const getUserProgress = async (chartLimit = 10) => api.get("/stats/progress", { params: { chartLimit } });

