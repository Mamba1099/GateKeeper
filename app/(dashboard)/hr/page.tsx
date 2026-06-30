"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Calendar, TrendingUp, Clock } from "lucide-react";

export default function HRDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">HR Dashboard</h2>
        <p className="text-gray-500">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <p className="text-xs text-gray-500">Active staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Departments
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <p className="text-xs text-gray-500">Active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today&apos;s Attendance
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">0%</div>
            <p className="text-xs text-gray-500">Checked in today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Average
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">0%</div>
            <p className="text-xs text-gray-500">Attendance rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-700">
                Manage Employees
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Add, edit, or deactivate employees
            </p>
          </div>
          <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-700">
                Manage Departments
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Configure department settings
            </p>
          </div>
          <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-700">View Reports</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Generate attendance reports
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
