"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Key, Eye, EyeOff } from "lucide-react";
import { useResetPassword } from "@/hooks/mutations/use-employee";
import { toast } from "sonner";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  employeeId,
  employeeName,
}: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const resetPassword = useResetPassword();

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await resetPassword.mutateAsync({
        id: employeeId,
        password: newPassword,
      });

      toast.success("Password reset successfully!");
      onOpenChange(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to reset password");
    }
  };

  const handleClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-112.5 bg-white p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" />
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Enter a new password for {employeeName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                New Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password (min 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white pr-10"
                  disabled={resetPassword.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400">Minimum 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                disabled={resetPassword.isPending}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> The employee will need to use this new
                password to log in. Make sure to share it securely.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
                disabled={resetPassword.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleReset}
                disabled={resetPassword.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
              >
                {resetPassword.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
