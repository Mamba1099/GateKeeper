import { checkInApi } from "@/lib/api/check-in-api";

export class CheckInService {
  static async checkIn(checkInTime: string) {
    const response = await checkInApi.checkIn({ checkInTime });
    return response;
  }

  static async checkOut() {
    const response = await checkInApi.checkOut();
    return response;
  }

  static async getStatus() {
    const response = await checkInApi.getStatus();
    return response;
  }
}
