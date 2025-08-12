import api from "@/lib/axios";
export const getAdminOverview = async () => {
    return api.get('/stats/admin-dashboard');
};