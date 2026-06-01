import { Link, useLocation } from "wouter";
import { LayoutDashboard, Utensils, Apple, CalendarDays, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/log", label: "Log", icon: Utensils },
  { href: "/foods", label: "Foods", icon: Apple },
  { href: "/planner", label: "Plan", icon: CalendarDays },
  { href: "/progress", label: "Stats", icon: LineChart },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background flex items-center justify-around h-16 px-2 pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href} className="flex-1">
            <div className="flex flex-col items-center justify-center h-full cursor-pointer gap-1">
              <div
                className={cn(
                  "p-1.5 rounded-full transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
              </div>
              <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
