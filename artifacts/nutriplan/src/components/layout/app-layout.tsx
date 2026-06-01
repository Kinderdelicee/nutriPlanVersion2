import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full min-h-screen md:h-screen md:overflow-y-auto pb-16 md:pb-0">
        <div className="p-4 md:p-8 flex-1 w-full max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
