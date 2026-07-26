"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { CheckInHistory } from "@/types/employee";

interface HistoryListProps {
  data: CheckInHistory[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  onPageChange: (page: number) => void;
}

export function HistoryList({
  data,
  isLoading,
  pagination,
  onPageChange,
}: HistoryListProps) {
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center min-h-50">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string, isLate: boolean) => {
    if (status === "CHECKED_OUT") {
      return (
        <Badge className="bg-emerald-100/80 text-emerald-700 backdrop-blur-sm">
          Completed
        </Badge>
      );
    }
    if (isLate) {
      return (
        <Badge className="bg-red-100/80 text-red-700 backdrop-blur-sm">
          Late
        </Badge>
      );
    }
    if (status === "CHECKED_IN") {
      return (
        <Badge className="bg-blue-100/80 text-blue-700 backdrop-blur-sm">
          Checked In
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100/80 text-gray-700 backdrop-blur-sm">
        Absent
      </Badge>
    );
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Check-in History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No check-in records found</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-gray-200/60 overflow-x-auto bg-white/40 backdrop-blur-sm">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-600">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      Check In
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      Check Out
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 text-right">
                      Hours
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((record) => (
                    <TableRow
                      key={record.id}
                      className="hover:bg-white/60 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {record.check_in_time
                          ? new Date(record.check_in_time).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "--:--"}
                      </TableCell>
                      <TableCell>
                        {record.check_out_time
                          ? new Date(record.check_out_time).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "--:--"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status, record.is_late)}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.hours_worked
                          ? `${record.hours_worked.toFixed(1)}h`
                          : "--"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}{" "}
                  of {pagination.total} records
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="bg-white/60 backdrop-blur-sm border-gray-200/60"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.total_pages}
                    className="bg-white/60 backdrop-blur-sm border-gray-200/60"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
