"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { HistoryList } from "@/components/dashboard/employee/history-list";
import { HistoryFilters } from "@/components/dashboard/employee/history-filters";
import { useCheckInHistory } from "@/hooks/queries/use-employee-queries";
import { Loader2 } from "lucide-react";

export default function EmployeeHistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, refetch } = useCheckInHistory(filters);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  const handleFilterChange = (newFilters: {
    start_date?: string;
    end_date?: string;
    status?: string;
  }) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
    refetch();
  };

  const handleReset = () => {
    setFilters({
      start_date: "",
      end_date: "",
      status: "",
      page: 1,
      limit: 10,
    });
    refetch();
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    refetch();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Check-in History
        </h2>
        <p className="text-gray-500 mt-1">View all your check-in records</p>
      </div>

      <HistoryFilters
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      <HistoryList
        data={data?.data?.records || []}
        isLoading={isLoading}
        pagination={
          data?.data?.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            total_pages: 1,
          }
        }
        onPageChange={handlePageChange}
      />
    </div>
  );
}
