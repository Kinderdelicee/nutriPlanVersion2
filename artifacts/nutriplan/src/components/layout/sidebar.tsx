import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import {
  LayoutDashboard,
  Utensils,
  Apple,
  CalendarDays,
  LineChart,
  User,
  LogOut,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@workspace/api-client-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/log", label: "Today's Log", icon: Utensils },
  { href: "/foods", label: "Foods", icon: Apple },
  { href: "/meals", label: "Saved Meals", icon: Utensils },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const [location] = useLocation();
  const { setToken } = useAuth();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setToken(null);
      }
    });
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <div className="flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href} onClick={onClick}>
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </div>
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive text-left mt-auto"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  );

  return (
    <>
      <div className="hidden border-r bg-muted/40 md:block w-64 h-full shrink-0">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-primary cursor-pointer">
              <Apple className="h-6 w-6" />
              <span className="">NutriPlan</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavLinks />
            </nav>
          </div>
        </div>
      </div>
      <div className="md:hidden flex h-14 items-center border-b bg-muted/40 px-4 w-full justify-between shrink-0">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary cursor-pointer">
          <Apple className="h-6 w-6" />
          <span className="">NutriPlan</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 sm:max-w-none">
            <SheetTitle>Navigation</SheetTitle>
            <nav className="grid gap-2 text-lg font-medium mt-4">
              <NavLinks />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
