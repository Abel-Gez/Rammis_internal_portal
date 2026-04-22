import api from './api';

export async function getDashboardOverview() {
    const res = await api.get("/dashboard/overview/");
    return res.data;
}