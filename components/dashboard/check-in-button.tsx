"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { useCheckInStatus } from "@/hooks/queries/use-check-in-queries";
import {
  useCheckIn,
  useCheckOut,
} from "@/hooks/mutations/use-check-in";

export function CheckInButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { data: statusData, refetch: refetchStatus } = useCheckInStatus();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const status = statusData?.data;
  const isCheckedIn = status?.isCheckedIn || false;
  const isCheckedOut = !!status?.checkOutTime;
  const isLoading = checkInMutation.isPending || checkOutMutation.isPending;

  const handleCheckIn = () => {
    checkInMutation.mutate(new Date().toISOString(), {
      onSuccess: () => {
        setIsOpen(false);
        router.refresh();
        refetchStatus();
      },
    });
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate(undefined, {
      onSuccess: () => {
        setIsOpen(false);
        router.refresh();
        refetchStatus();
      },
    });
  };

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
      refetchStatus();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          {isCheckedIn && !isCheckedOut ? "Check Out" : "Check In"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            {isCheckedIn && !isCheckedOut ? "Check Out" : "Check In"}
          </DialogTitle>
          <DialogDescription>
            {isCheckedIn && !isCheckedOut
              ? "Confirm your check-out time"
              : "Confirm your check-in time for today"}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Current Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date().toLocaleTimeString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          {status && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Today&apos;s Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {status.checkInTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>
                      Checked in at:{" "}
                      {new Date(status.checkInTime).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {status.isLate && (
                  <div className="flex items-center gap-2 text-sm text-yellow-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Late by {status.lateMinutes} minutes</span>
                  </div>
                )}
                {status.checkOutTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>
                      Checked out at:{" "}
                      {new Date(status.checkOutTime).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!isCheckedIn && new Date().getHours() >= 10 && (
            <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
              <AlertCircle className="mb-1 h-4 w-4" />
              <p>
                Note: You are checking in after 10:00 AM. This will be marked as
                late.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-0 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={
              isCheckedIn && !isCheckedOut ? handleCheckOut : handleCheckIn
            }
            disabled={isLoading}
            className={
              isCheckedIn && !isCheckedOut
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            }
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCheckedIn && !isCheckedOut
              ? "Confirm Check Out"
              : "Confirm Check In"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
