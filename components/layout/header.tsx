"use client";

import { Button } from "@/components/ui/button";
import { Menu, User} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
}

export function Header({ onMenuClick, title, subtitle }: HeaderProps) {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 h-16 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 hidden sm:block truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-linear-to-br from-blue-50 to-blue-100 text-blue-700 text-xs font-medium">
                  {user ? getInitials(user.name || "User") : "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium text-gray-700">
                {user?.name?.split(" ")[0] || "User"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role} • {user?.departmentName}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
