"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, LogOut } from "lucide-react";
import { CheckInButton } from "@/components/dashboard/check-in-button";

interface TodayStatusProps {
  status: {
    is_checked_in: boolean;
    check_in_time?: string;
    check_out_time?: string;
    is_late?: boolean;
    late_minutes?: number;
    hours_worked?: number;
    is_early_departure?: boolean;
  };
  isLoading?: boolean;
}

export function TodayStatusCard({ status, isLoading }: TodayStatusProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isCheckedIn = status?.is_checked_in;
  const isCheckedOut = !!status?.check_out_time;

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <div
        className={`h-1 ${isCheckedIn ? "bg-emerald-500" : "bg-gray-300"}`}
      />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Today&apos;s Status
          </CardTitle>
          <Badge
            variant={isCheckedIn ? "default" : "secondary"}
            className={
              isCheckedIn
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-600"
            }
          >
            {isCheckedIn
              ? isCheckedOut
                ? "Completed"
                : "In Progress"
              : "Not Started"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">Check In</p>
            <div className="flex items-center gap-2 mt-1">
              {isCheckedIn ? (
                <>
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium text-gray-900">
                    {status?.check_in_time
                      ? new Date(status.check_in_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">--:--</span>
                </>
              )}
            </div>
            {status?.is_late && (
              <p className="text-xs text-red-500 mt-0.5">
                Late by {status.late_minutes} min
              </p>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-500">Check Out</p>
            <div className="flex items-center gap-2 mt-1">
              {isCheckedOut ? (
                <>
                  <LogOut className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-gray-900">
                    {status?.check_out_time
                      ? new Date(status.check_out_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">--:--</span>
                </>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500">Hours Worked</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-gray-900">
                {status?.hours_worked
                  ? `${status.hours_worked.toFixed(1)}h`
                  : "--"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {!isCheckedIn && "You haven't checked in today"}
            {isCheckedIn && !isCheckedOut && "Don't forget to check out"}
            {isCheckedOut && "✅ Your workday is complete"}
          </p>
          <CheckInButton />
        </div>
      </CardContent>
    </Card>
  );
}
