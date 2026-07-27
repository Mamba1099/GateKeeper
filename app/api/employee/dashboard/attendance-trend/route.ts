import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYEE") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const summaries = await prisma.attendanceSummary.findMany({
      where: {
        user_id: userId,
        year: { gte: sixMonthsAgo.getFullYear() },
      },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    const filtered = summaries.filter((s) => {
      if (s.year > sixMonthsAgo.getFullYear()) return true;
      if (
        s.year === sixMonthsAgo.getFullYear() &&
        s.month >= sixMonthsAgo.getMonth() + 1
      )
        return true;
      return false;
    });

    const department = await prisma.user.findUnique({
      where: { id: userId },
      select: { department_id: true },
    });

    let departmentAvg = 0;
    if (department) {
      const deptUsers = await prisma.user.findMany({
        where: { department_id: department.department_id },
        select: { id: true },
      });
      const deptUserIds = deptUsers.map((u) => u.id);

      const deptSummaries = await prisma.attendanceSummary.findMany({
        where: {
          user_id: { in: deptUserIds },
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        },
      });

      if (deptSummaries.length > 0) {
        departmentAvg = Math.round(
          deptSummaries.reduce((acc, s) => acc + s.attendance_percentage, 0) /
            deptSummaries.length,
        );
      }
    }

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const attendanceData = filtered.map((s) => ({
      month: `${monthNames[s.month - 1]} ${s.year}`,
      attendance: Math.round(s.attendance_percentage),
      punctuality: Math.round(s.punctuality_percentage),
    }));

    return NextResponse.json({
      success: true,
      data: {
        attendance: attendanceData,
        department_avg: departmentAvg > 0 ? departmentAvg : null,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance trend:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendance trend" },
      { status: 500 },
    );
  }
}
