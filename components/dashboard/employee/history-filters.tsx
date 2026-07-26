"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, RotateCcw } from "lucide-react";

interface HistoryFiltersProps {
  onFilterChange: (filters: {
    start_date?: string;
    end_date?: string;
    status?: string;
  }) => void;
  onReset: () => void;
}

export function HistoryFilters({
  onFilterChange,
  onReset,
}: HistoryFiltersProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [status, setStatus] = useState<string>("all");

  const handleApply = () => {
    const filters: { start_date?: string; end_date?: string; status?: string } =
      {};
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    if (status !== "all") filters.status = status;
    onFilterChange(filters);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setStatus("all");
    onReset();
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white/60 backdrop-blur-sm border-gray-200/60 focus:border-blue-400 rounded-lg"
                placeholder="Start Date"
              />
            </div>
            <div>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white/60 backdrop-blur-sm border-gray-200/60 focus:border-blue-400 rounded-lg"
                placeholder="End Date"
              />
            </div>
            <div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-white/60 backdrop-blur-sm border-gray-200/60 focus:border-blue-400 rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-md border-gray-200/60 rounded-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                  <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                  <SelectItem value="LATE">Late</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleApply}
              className="bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <Search className="h-4 w-4 mr-2" />
              Apply
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="bg-white/60 backdrop-blur-sm border-gray-200/60 text-gray-600 hover:bg-white/80 transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
