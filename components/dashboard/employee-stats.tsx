"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, AlertCircle, Award } from "lucide-react";

interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  onTimeDays: number;
  attendancePercentage: number;
  punctualityPercentage: number;
  averageHoursWorked: number;
  totalHoursWorked: number;
  currentStreak: number;
  bestStreak: number;
}

interface MonthlyData {
  month: string;
  attendance: number;
  punctuality: number;
  hoursWorked: number;
}

interface RecentActivity {
  id: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  status: "on-time" | "late" | "absent";
  hoursWorked: number;
}

export function EmployeeStats() {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year"
  >("month");

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/check-in/stats?period=${selectedPeriod}`,
      );
      const data = await response.json();

      if (data.success) {
        setStats(data.data.stats);
        setMonthlyData(data.data.monthlyData || []);
        setRecentActivity(data.data.recentActivity || []);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      if (mounted) {
        await fetchStats();
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-500">No attendance data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Tabs
          value={selectedPeriod}
          onValueChange={(value: string) =>
            setSelectedPeriod(value as "week" | "month" | "year")
          }
          className="w-75"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
            <CardDescription>Present days / Total days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.attendancePercentage}%
            </div>
            <Progress value={stats.attendancePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.presentDays} / {stats.totalDays} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Punctuality Rate
            </CardTitle>
            <CardDescription>On-time arrivals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.punctualityPercentage}%
            </div>
            <Progress value={stats.punctualityPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.onTimeDays} / {stats.presentDays} on time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Current Streak
            </CardTitle>
            <CardDescription>Consecutive days present</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{stats.currentStreak}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            {stats.currentStreak > 0 && (
              <div className="flex items-center gap-1 mt-2 text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">Best: {stats.bestStreak} days</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
            <CardDescription>Total & Average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalHoursWorked.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Avg {stats.averageHoursWorked.toFixed(1)} hours/day
            </p>
          </CardContent>
        </Card>
      </div>

      {monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Trend</CardTitle>
            <CardDescription>Attendance performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyData.slice(0, 6).map((month) => (
                <div key={month.month} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{month.month}</span>
                    <span className="font-medium">{month.attendance}%</span>
                  </div>
                  <Progress value={month.attendance} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{month.hoursWorked}h worked</span>
                    <span
                      className={
                        month.punctuality >= 80
                          ? "text-green-600"
                          : "text-yellow-600"
                      }
                    >
                      {month.punctuality}% on time
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Your last 10 check-in records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">Check In</th>
                    <th className="text-left py-2 font-medium">Check Out</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-right py-2 font-medium">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity) => (
                    <tr key={activity.id} className="border-b last:border-0">
                      <td className="py-2">{activity.date}</td>
                      <td className="py-2">
                        {activity.checkInTime || "--:--"}
                      </td>
                      <td className="py-2">
                        {activity.checkOutTime || "--:--"}
                      </td>
                      <td className="py-2">
                        <Badge
                          variant={
                            activity.status === "on-time"
                              ? "default"
                              : activity.status === "late"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {activity.status === "on-time" && "On Time"}
                          {activity.status === "late" && "Late"}
                          {activity.status === "absent" && "Absent"}
                        </Badge>
                      </td>
                      <td className="text-right py-2">
                        {activity.hoursWorked > 0
                          ? `${activity.hoursWorked.toFixed(1)}h`
                          : "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {(stats.currentStreak >= 5 || stats.punctualityPercentage >= 90) && (
        <Card className="bg-linear-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="font-semibold">Great Job! 🎉</p>
                <p className="text-sm text-muted-foreground">
                  {stats.currentStreak >= 5 &&
                    `You're on a ${stats.currentStreak}-day attendance streak! `}
                  {stats.punctualityPercentage >= 90 &&
                    `Your punctuality is excellent!`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
