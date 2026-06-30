"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, ArrowLeft, Search, Building2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Building2 className="h-20 w-20 text-gray-300 dark:text-gray-600" />
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center">
                404
              </div>
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has
            been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Search className="h-4 w-4" />
              <span>We couldn&apos;t find the page you were looking for</span>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              GateKeeper Check-in System • Version 1.0
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
