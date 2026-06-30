import apiClient from "../api-client";

export const checkInApi = {
  checkIn: async (data: { checkInTime: string }) => {
    const response = await apiClient.post("/api/check-in", data);
    return response.data;
  },

  checkOut: async () => {
    const response = await apiClient.post("/api/check-in/checkout");
    return response.data;
  },

  getStatus: async () => {
    const response = await apiClient.get("/api/check-in/status");
    return response.data;
  },
};
