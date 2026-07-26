"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  User,
  Calendar,
  LogOut,
  Users,
  Building2,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isHR = user.role === "HR" || user.role === "ADMIN";

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/employee",
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ["EMPLOYEE"],
    },
    {
      title: "My History",
      href: "/employee/history",
      icon: <Calendar className="h-5 w-5" />,
      roles: ["EMPLOYEE"],
    },
    {
      title: "Profile",
      href: "/employee/profile",
      icon: <User className="h-5 w-5" />,
      roles: ["EMPLOYEE"],
    },
    {
      title: "Dashboard",
      href: "/hr",
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ["HR", "ADMIN"],
    },
    {
      title: "Employees",
      href: "/hr/employees",
      icon: <Users className="h-5 w-5" />,
      roles: ["HR", "ADMIN"],
    },
    {
      title: "Departments",
      href: "/hr/departments",
      icon: <Building2 className="h-5 w-5" />,
      roles: ["HR", "ADMIN"],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role),
  );

  const isActive = (href: string) => {
    if (href === "/employee" || href === "/hr") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden lg:flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
          "bg-linear-to-br from-blue-50 via-white to-purple-50",
          "border-r border-gray-200/60",
          "shadow-xl shadow-gray-200/50",
          isOpen ? "w-64" : "w-20",
        )}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-75 h-75 rounded-full bg-blue-500/8 -top-32 -right-24" />
          <div className="absolute w-62.5 h-62.5 rounded-full bg-purple-500/8 -bottom-20 -left-20" />
          <div className="absolute w-45 h-45 rounded-full bg-cyan-500/8 top-1/2 -right-16 -translate-y-1/2" />
          <div className="absolute w-30 h-30 rounded-full bg-amber-500/8 bottom-1/4 right-1/4" />
          <div className="absolute w-25 h-25 rounded-full bg-pink-500/8 top-1/4 left-1/4" />
        </div>
        <div className="relative z-10 flex flex-col h-full backdrop-blur-[2px]">
          {/* Logo */}
          <div
            className={cn(
              "flex h-16 items-center border-b border-gray-200/60 shrink-0 bg-white/60 backdrop-blur-sm",
              isOpen ? "px-4" : "px-3 justify-center",
            )}
          >
            <Link
              href={isHR ? "/hr" : "/employee"}
              className="flex items-center gap-2.5 group"
            >
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-shadow">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span
                className={cn(
                  "font-semibold text-gray-900 transition-all duration-200",
                  !isOpen && "opacity-0 w-0",
                )}
              >
                GateKeeper
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {filteredNavItems.map((item) => (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                        isActive(item.href)
                          ? "bg-blue-50/80 text-blue-700 shadow-sm backdrop-blur-sm border border-blue-100/50"
                          : "text-gray-700 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm border border-transparent hover:border-gray-200/50",
                        !isOpen && "justify-center",
                      )}
                    >
                      <span
                        className={cn(
                          "shrink-0 transition-colors",
                          isActive(item.href)
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-600",
                        )}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={cn(
                          "transition-all duration-200",
                          !isOpen && "opacity-0 w-0",
                        )}
                      >
                        {item.title}
                      </span>
                      {isActive(item.href) && isOpen && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  {!isOpen && (
                    <TooltipContent side="right" className="font-medium">
                      {item.title}
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </nav>
          </ScrollArea>

          {/* User Profile & Logout */}
          <div
            className={cn(
              "border-t border-gray-200/60 shrink-0 bg-white/60 backdrop-blur-sm",
              isOpen ? "p-4" : "p-3",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3",
                !isOpen && "justify-center",
              )}
            >
              <Avatar className="h-9 w-9 border-2 border-white/80 shadow-md shrink-0">
                <AvatarFallback className="bg-linear-to-br from-blue-50 to-blue-100 text-blue-700 text-sm font-medium">
                  {getInitials(user.name || "User")}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "flex-1 min-w-0 transition-all duration-200",
                  !isOpen && "opacity-0 w-0",
                )}
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.role} • {user.departmentName}
                </p>
              </div>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50/80 shrink-0 transition-colors",
                      !isOpen && "ml-0",
                    )}
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar (Slide-in) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:hidden flex flex-col transition-transform duration-300 ease-in-out w-64 overflow-hidden",
          "bg-linear-to-br from-blue-50 via-white to-purple-50",
          "border-r border-gray-200/60",
          "shadow-2xl shadow-gray-300/50",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Floating Shapes for Mobile */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-75 h-75 rounded-full bg-blue-500/8 -top-32 -right-24" />
          <div className="absolute w-62.5 h-62.5 rounded-full bg-purple-500/8 -bottom-20 -left-20" />
          <div className="absolute w-45 h-45 rounded-full bg-cyan-500/8 top-1/2 -right-16 -translate-y-1/2" />
          <div className="absolute w-30 h-30 rounded-full bg-amber-500/8 bottom-1/4 right-1/4" />
          <div className="absolute w-25 h-25 rounded-full bg-pink-500/8 top-1/4 left-1/4" />
        </div>

        <div className="relative z-10 flex flex-col h-full backdrop-blur-[2px]">
          {/* Logo */}
          <div className="flex h-16 items-center px-4 border-b border-gray-200/60 shrink-0 bg-white/60 backdrop-blur-sm">
            <Link
              href={isHR ? "/hr" : "/employee"}
              className="flex items-center gap-2.5"
            >
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-500/25">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-semibold text-gray-900">GateKeeper</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={onClose}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "bg-blue-50/80 text-blue-700 shadow-sm backdrop-blur-sm border border-blue-100/50"
                      : "text-gray-700 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm border border-transparent hover:border-gray-200/50",
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive(item.href) ? "text-blue-600" : "text-gray-400",
                    )}
                  >
                    {item.icon}
                  </span>
                  {item.title}
                  {isActive(item.href) && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                  )}
                </Link>
              ))}
            </nav>
          </ScrollArea>

          {/* User Profile & Logout */}
          <div className="border-t border-gray-200/60 p-4 shrink-0 bg-white/60 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-white/80 shadow-md">
                <AvatarFallback className="bg-linear-to-br from-blue-50 to-blue-100 text-blue-700 text-sm font-medium">
                  {getInitials(user.name || "User")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.role} • {user.departmentName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50/80 shrink-0"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
